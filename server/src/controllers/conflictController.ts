import { Request, Response } from "express";
import { checkEventConflicts } from "../services/conflictService.js";

export const checkConflicts = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      venueId,
      startDate,
      endDate,
      excludeEventId,
    } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "startDate and endDate are required.",
      });
    }

    const result = await checkEventConflicts({
      venueId,
      startDate,
      endDate,
      excludeEventId,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error(
      "Conflict check error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to check event conflicts.",
    });
  }
};