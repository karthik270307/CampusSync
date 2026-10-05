import { Request, Response } from "express";
import { Club } from "../models/Club.js";

export const getClubs = async (_req: Request, res: Response) => {
  try {
    const clubs = await Club.find()
      .sort({ name: 1 })
      .select("_id name");

    return res.json({
      success: true,
      data: clubs,
    });
  } catch (error) {
    console.error("Get clubs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch clubs",
    });
  }
};