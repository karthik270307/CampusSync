import { Request, Response } from "express";
import { Venue } from "../models/Venue.js";

export const getVenues = async (
  _req: Request,
  res: Response
) => {
  try {
    const venues = await Venue.find()
      .sort({ capacity: 1 });

    res.json({
      success: true,
      data: venues,
    });
  } catch (error) {
    console.error("Get venues error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch venues",
    });
  }
};