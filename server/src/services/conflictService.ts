import mongoose from "mongoose";
import { Event } from "../models/Event.js";
import { AcademicCalendar } from "../models/AcademicCalendar.js";
import { Venue } from "../models/Venue.js";

interface ConflictCheckInput {
  venueId?: string;
  startDate: string;
  endDate: string;
  excludeEventId?: string;
}

interface ConflictResult {
  hasConflict: boolean;
  academicConflict: boolean;
  venueConflict: boolean;
  conflicts: {
    type: "academic" | "venue";
    message: string;
    eventId?: string;
    title?: string;
  }[];
}

export const checkEventConflicts = async (
  data: ConflictCheckInput
): Promise<ConflictResult> => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  const conflicts: ConflictResult["conflicts"] = [];

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    throw new Error("Invalid event date or time.");
  }

  if (startDate >= endDate) {
    throw new Error("Event end time must be after start time.");
  }

  /*
   * -------------------------------------------------------
   * 1. ACADEMIC CALENDAR CONFLICT
   * -------------------------------------------------------
   */

  const eventStartDay = new Date(startDate);
  eventStartDay.setUTCHours(0, 0, 0, 0);

  const academicConflicts = await AcademicCalendar.find({
    $and: [
      {
        $or: [
          { isRestricted: true },
          { isRestricted: { $ne: false }, isBlocking: true },
        ],
      },
      { startDate: { $lte: endDate } },
      {
        $or: [
          { endDate: { $gte: startDate } },
          { endDate: { $gte: eventStartDay } },
        ],
      },
    ],
  });

  for (const calendar of academicConflicts) {
    conflicts.push({
      type: "academic",
      message: `Event overlaps with restricted academic period: ${calendar.title}`,
      title: calendar.title,
    });
  }

  /*
   * -------------------------------------------------------
   * 2. VENUE CONFLICT
   * -------------------------------------------------------
   */

  if (data.venueId && typeof data.venueId === "string" && data.venueId.trim()) {
    const cleanVenue = data.venueId.trim();
    let resolvedVenueId: mongoose.Types.ObjectId | undefined;

    if (mongoose.Types.ObjectId.isValid(cleanVenue)) {
      resolvedVenueId = new mongoose.Types.ObjectId(cleanVenue);
    } else {
      const searchPattern = cleanVenue.replace(/[-_]/g, " ");
      const venue = await Venue.findOne({
        $or: [
          { name: new RegExp(searchPattern, "i") },
          { location: new RegExp(searchPattern, "i") },
        ],
      });
      if (venue) {
        resolvedVenueId = venue._id as mongoose.Types.ObjectId;
      }
    }

    if (resolvedVenueId) {
      const venueQuery: Record<string, any> = {
        venueId: resolvedVenueId,

      /*
       * Existing event starts before proposed event ends
       * AND
       * Existing event ends after proposed event starts
       */
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },

      status: {
        $in: [
          "submitted",
          "faculty_review",
          "hod_review",
          "admin_review",
          "approved",
          "registration_open",
          "ongoing",
        ],
      },
    };

    if (
      data.excludeEventId &&
      mongoose.Types.ObjectId.isValid(data.excludeEventId)
    ) {
      venueQuery._id = {
        $ne: new mongoose.Types.ObjectId(
          data.excludeEventId
        ),
      };
    }

    const venueConflicts = await Event.find(venueQuery)
      .select("_id title startDate endDate status")
      .sort({ startDate: 1 });

    for (const event of venueConflicts) {
      conflicts.push({
        type: "venue",
        message: `Selected venue is already booked during this time.`,
        eventId: event._id.toString(),
        title: event.title,
      });
    }
  }
}

  const academicConflict = conflicts.some(
    (conflict) => conflict.type === "academic"
  );

  const venueConflict = conflicts.some(
    (conflict) => conflict.type === "venue"
  );

  return {
    hasConflict: conflicts.length > 0,
    academicConflict,
    venueConflict,
    conflicts,
  };
};