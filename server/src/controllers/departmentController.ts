import { Request, Response } from "express";
import { Department } from "../models/Department.js";

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await Department.find({}).sort({ name: 1 });
    res.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Failed to fetch departments", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
};
