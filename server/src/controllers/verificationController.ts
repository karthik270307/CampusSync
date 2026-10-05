import { Request, Response } from "express";
import { User, AccountStatus } from "../models/User.js";
import { AuthenticatedRequest } from "../middleware/authenticate.js";

export const getPendingRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const requests = await User.find({
      accountStatus: { $in: ["pending_verification", "resubmission_required"] },
    })
      .populate("departmentId", "name code")
      .sort({ verificationSubmittedAt: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch pending requests",
    });
  }
};

export const approveRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (!req.user || !req.user.userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        accountStatus: "active",
        verifiedAt: new Date(),
        verifiedBy: req.user.userId,
      },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({ success: true, message: "User verified and activated", data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to approve user" });
  }
};

export const rejectRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { comments } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        accountStatus: "rejected",
        verificationComments: comments,
      },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({ success: true, message: "User verification rejected", data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to reject user" });
  }
};

export const requestResubmission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { comments } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        accountStatus: "resubmission_required",
        verificationComments: comments,
      },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({ success: true, message: "Resubmission requested", data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to request resubmission" });
  }
};
