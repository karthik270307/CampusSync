import { Request, Response } from "express";
import { createEvent, getEvents, getEventById, updateEvent, cancelEvent } from "../services/eventService.js";
import { checkEventConflicts } from "../services/conflictService.js";
import { AuthenticatedRequest } from "../middleware/authenticate.js";
import { createApprovalWorkflow } from "../services/approvalService.js";
import { Event } from "../models/Event.js";

export const create = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const {
      venueId,
      startDate,
      endDate,
    } = req.body;

    // 1. Validate request dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid event date or time format.",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "Event end time must be after start time.",
      });
    }

    // 2. Check conflicts before creating the event
    const conflictResult = await checkEventConflicts({
      venueId,
      startDate,
      endDate,
    });

    if (conflictResult.hasConflict) {
      return res.status(409).json({
        success: false,
        message: "Event cannot be proposed because a scheduling conflict exists.",
        data: conflictResult,
      });
    }

    // 3. Create the event only when there is NO conflict
    const isSubmitted = req.body.status === "submitted";
    const initialStatus = isSubmitted ? "faculty_review" : "draft";

    const event = await createEvent({
      ...req.body,
      status: initialStatus,
      organizerId: req.user.userId,
    });

    if (isSubmitted) {
      try {
        await createApprovalWorkflow(event._id.toString());
      } catch (err: any) {
        // Rollback event creation
        await Event.findByIdAndDelete(event._id);
        
        return res.status(409).json({
          success: false,
          message: err.message || "Failed to submit event to approval workflow.",
        });
      }
    }

    return res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error("Create event error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create event.",
    });
  }
};

export const list = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const events = await getEvents({
      search:
        typeof req.query.search === "string"
          ? req.query.search
          : undefined,

      category:
        typeof req.query.category === "string"
          ? req.query.category
          : undefined,

      departmentId:
        typeof req.query.departmentId === "string"
          ? req.query.departmentId
          : undefined,

      status:
        typeof req.query.status === "string"
          ? req.query.status
          : undefined,

      from:
        typeof req.query.from === "string"
          ? req.query.from
          : undefined,

      to:
        typeof req.query.to === "string"
          ? req.query.to
          : undefined,
    });

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

export const getOne = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const event = await getEventById(id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });

      return;
    }

    res.json({
      success: true,
      data: event,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
    });
  }
};

export const update = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { startDate, endDate, venueId } = req.body;

    if (startDate || endDate || venueId !== undefined) {
      const existing = await getEventById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Event not found",
        });
        return;
      }

      const effectiveStart = startDate || existing.startDate.toISOString();
      const effectiveEnd = endDate || existing.endDate.toISOString();
      const effectiveVenue = venueId !== undefined ? venueId : existing.venueId?.toString();

      const start = new Date(effectiveStart);
      const end = new Date(effectiveEnd);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        res.status(400).json({
          success: false,
          message: "Invalid event date or time format.",
        });
        return;
      }

      if (start >= end) {
        res.status(400).json({
          success: false,
          message: "Event end time must be after start time.",
        });
        return;
      }

      const conflictResult = await checkEventConflicts({
        venueId: effectiveVenue,
        startDate: effectiveStart,
        endDate: effectiveEnd,
        excludeEventId: id,
      });

      if (conflictResult.hasConflict) {
        res.status(409).json({
          success: false,
          message: "Event cannot be updated because a scheduling conflict exists.",
          data: conflictResult,
        });
        return;
      }
    }

    let existingEvent = await getEventById(id);
    if (!existingEvent) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    const originalEvent = existingEvent;

    let updateData = { ...req.body };
    if (updateData.status === "submitted") {
      updateData.status = "faculty_review";
    }

    const event = await updateEvent(
      id,
      updateData
    );

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });

      return;
    }

    if (req.body.status === "submitted") {
      try {
        await createApprovalWorkflow(event._id.toString());
      } catch (err: any) {
        // Rollback status
        await updateEvent(id, { status: originalEvent?.status || "draft" });

        res.status(409).json({
          success: false,
          message: err.message || "Failed to submit event to approval workflow.",
        });
        return;
      }
    }

    res.json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
};

export const cancel = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const event = await cancelEvent(id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });

      return;
    }

    res.json({
      success: true,
      message: "Event cancelled successfully",
      data: event,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to cancel event",
    });
  }
};