import { Request, Response } from "express";
import { loginUser, registerUser } from "../services/authService.js";

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    const result = await loginUser(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Login failed";

    res.status(401).json({
      success: false,
      message,
    });
  }
};

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, role, phone, registerNumber, employeeId, departmentId, verificationDocumentUrl, googleId } = req.body;

    if (!name || !email || !role) {
      res.status(400).json({
        success: false,
        message: "Name, email, and role are required",
      });
      return;
    }

    const result = await registerUser({
      name,
      email,
      password,
      role,
      phone,
      registerNumber,
      employeeId,
      departmentId,
      verificationDocumentUrl,
      googleId
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";

    res.status(400).json({
      success: false,
      message,
    });
  }
};
