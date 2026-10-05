import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authenticate.js";

import {
  getApprovalWorkflow,
  getMyApprovals,
  approveApproval,
  requestRevision as requestRevisionService,
  rejectApproval,
} from "../services/approvalService.js";

/**
 * GET /api/approvals
 *
 * Returns pending approval requests assigned
 * to the currently logged-in reviewer.
 */
export const getMyApprovalRequests = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const approvals = await getMyApprovals(
      req.user.userId,
      req.user.role
    );

    return res.json({
      success: true,
      data: approvals,
    });
  } catch (error: any) {
    console.error(
      "Get my approvals error:",
      error
    );

    return res.status(403).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch approval requests.",
    });
  }
};

/**
 * GET /api/approvals/:eventId
 *
 * Returns the complete approval workflow
 * for a particular event.
 */
export const getWorkflow = async (
  req: Request,
  res: Response
) => {
  try {
    const { eventId } = req.params;

    const approvals =
      await getApprovalWorkflow(eventId as string);

    return res.json({
      success: true,
      data: approvals,
    });
  } catch (error: any) {
    console.error(
      "Get approval workflow error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch approval workflow.",
    });
  }
};

export const approve = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }
    const { approvalId } = req.params;
    const approval = await approveApproval(approvalId as string, req.user.userId, req.user.role);
    return res.json({ success: true, data: approval });
  } catch (error: any) {
    console.error("Approve error:", error);
    return res.status(403).json({ success: false, message: error.message || "Failed to approve." });
  }
};

export const requestRevision = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }
    const { approvalId } = req.params;
    const { comments } = req.body;
    
    if (!comments) {
      return res.status(400).json({ success: false, message: "Comments are required for requesting a revision." });
    }

    const approval = await requestRevisionService(approvalId as string, req.user.userId, req.user.role, comments);
    return res.json({ success: true, data: approval });
  } catch (error: any) {
    console.error("Revision error:", error);
    const status = error.message.includes("required") ? 400 : 403;
    return res.status(status).json({ success: false, message: error.message || "Failed to request revision." });
  }
};

export const reject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }
    const { approvalId } = req.params;
    const { comments } = req.body;
    
    if (!comments) {
      return res.status(400).json({ success: false, message: "Comments are required for rejecting." });
    }

    const approval = await rejectApproval(approvalId as string, req.user.userId, req.user.role, comments);
    return res.json({ success: true, data: approval });
  } catch (error: any) {
    console.error("Reject error:", error);
    const status = error.message.includes("required") ? 400 : 403;
    return res.status(status).json({ success: false, message: error.message || "Failed to reject." });
  }
};