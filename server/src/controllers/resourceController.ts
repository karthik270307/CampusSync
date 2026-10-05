import { Request, Response } from "express";
import { Resource } from "../models/Resource.js";

export const getResources = async (
  _req: Request,
  res: Response
) => {
  try {
    const resources = await Resource.find()
      .sort({ name: 1 });

    res.json({
      success: true,
      data: resources,
    });
  } catch (error) {
    console.error("Get resources error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch resources",
    });
  }
};