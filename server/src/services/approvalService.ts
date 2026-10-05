import mongoose from "mongoose";
import { Approval, IApproval, ApprovalStage, ApprovalDecision } from "../models/Approval.js";
import { User } from "../models/User.js";
import { Event } from "../models/Event.js";

export const createApprovalWorkflow = async (
  eventId: mongoose.Types.ObjectId | string
): Promise<IApproval[]> => {
  const eventObjectId = typeof eventId === "string" ? new mongoose.Types.ObjectId(eventId) : eventId;

  const event = await Event.findById(eventObjectId);
  if (!event) {
    throw new Error("Event not found.");
  }

  if (!event.departmentId) {
    throw new Error("Department is required for proposal submission.");
  }

  const facultyAdvisor = await User.findOne({
    role: "faculty_advisor",
    departmentId: event.departmentId,
    isActive: true,
  });

  if (!facultyAdvisor) {
    throw new Error("No active Faculty Advisor is assigned to this department.");
  }

  const hod = await User.findOne({
    role: "hod",
    departmentId: event.departmentId,
    isActive: true,
  });

  if (!hod) {
    throw new Error("No active HOD is assigned to this department.");
  }

  const admin = await User.findOne({
    role: "admin",
    isActive: true,
  });

  if (!admin) {
    throw new Error("No active Admin is available for final approval.");
  }

  // Clear any existing workflow if this is a resubmission
  await Approval.deleteMany({ eventId: eventObjectId });

  const workflow = [
    {
      eventId: eventObjectId,
      stage: "faculty_advisor" as ApprovalStage,
      assignedTo: facultyAdvisor._id,
      decision: "pending" as ApprovalDecision,
    },
    {
      eventId: eventObjectId,
      stage: "hod" as ApprovalStage,
      assignedTo: hod._id,
      decision: "pending" as ApprovalDecision,
    },
    {
      eventId: eventObjectId,
      stage: "admin" as ApprovalStage,
      assignedTo: admin._id,
      decision: "pending" as ApprovalDecision,
    }
  ];

  const approvals = await Approval.insertMany(workflow);

  await Event.findByIdAndUpdate(eventObjectId, {
    status: "faculty_review"
  });

  return approvals;
};

export const getApprovalWorkflow = async (
  eventId: mongoose.Types.ObjectId | string
): Promise<IApproval[]> => {
  const eventObjectId = typeof eventId === "string" ? new mongoose.Types.ObjectId(eventId) : eventId;
  return await Approval.find({ eventId: eventObjectId }).sort({ createdAt: 1 }).populate("assignedTo", "name email");
};

export const getMyApprovals = async (
  userId: string,
  role: string
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  const allowedRoles = [
    "faculty_advisor",
    "hod",
    "admin",
  ];

  if (!allowedRoles.includes(role)) {
    throw new Error(
      "You are not authorized to view approval requests."
    );
  }

  const approvals = await Approval.find({
    assignedTo: new mongoose.Types.ObjectId(userId),
    decision: "pending",
  })
    .populate(
      "eventId",
      "title description category startDate endDate capacity status organizerId clubId departmentId venueId budget"
    )
    .populate(
      "assignedTo",
      "name email role departmentId"
    )
    .sort({ createdAt: -1 });

  return approvals;
};

export const approveApproval = async (
  approvalId: string,
  userId: string,
  role: string
) => {
  const approval = await Approval.findById(approvalId);
  if (!approval) throw new Error("Approval not found.");

  if (approval.decision !== "pending") {
    throw new Error("Approval is not pending.");
  }

  if (approval.assignedTo?.toString() !== userId) {
    throw new Error("You are not authorized to approve this request.");
  }

  if (approval.stage !== role) {
    throw new Error("Role does not match approval stage.");
  }

  const event = await Event.findById(approval.eventId);
  if (!event) throw new Error("Event not found.");

  const stageToStatusMap: Record<string, string> = {
    faculty_advisor: "faculty_review",
    hod: "hod_review",
    admin: "admin_review",
  };

  if (event.status !== stageToStatusMap[approval.stage]) {
    throw new Error("Event is not in the correct status for this approval stage.");
  }

  approval.decision = "approved";
  approval.decidedAt = new Date();
  await approval.save();

  if (approval.stage === "faculty_advisor") {
    event.status = "hod_review";
  } else if (approval.stage === "hod") {
    event.status = "admin_review";
  } else if (approval.stage === "admin") {
    event.status = "approved";
  }

  await event.save();
  return approval;
};

export const requestRevision = async (
  approvalId: string,
  userId: string,
  role: string,
  comments: string
) => {
  if (!comments || !comments.trim()) {
    throw new Error("Comments are required for requesting a revision.");
  }

  const approval = await Approval.findById(approvalId);
  if (!approval) throw new Error("Approval not found.");

  if (approval.decision !== "pending") {
    throw new Error("Approval is not pending.");
  }

  if (approval.assignedTo?.toString() !== userId) {
    throw new Error("You are not authorized to request revision for this request.");
  }

  if (approval.stage !== role) {
    throw new Error("Role does not match approval stage.");
  }

  const event = await Event.findById(approval.eventId);
  if (!event) throw new Error("Event not found.");

  const stageToStatusMap: Record<string, string> = {
    faculty_advisor: "faculty_review",
    hod: "hod_review",
    admin: "admin_review",
  };

  if (event.status !== stageToStatusMap[approval.stage]) {
    throw new Error("Event is not in the correct status for this approval stage.");
  }

  approval.decision = "revision_requested";
  approval.comments = comments;
  approval.decidedAt = new Date();
  await approval.save();

  event.status = "draft";
  await event.save();

  return approval;
};

export const rejectApproval = async (
  approvalId: string,
  userId: string,
  role: string,
  comments: string
) => {
  if (!comments || !comments.trim()) {
    throw new Error("Comments are required for rejecting.");
  }

  const approval = await Approval.findById(approvalId);
  if (!approval) throw new Error("Approval not found.");

  if (approval.decision !== "pending") {
    throw new Error("Approval is not pending.");
  }

  if (approval.assignedTo?.toString() !== userId) {
    throw new Error("You are not authorized to reject this request.");
  }

  if (approval.stage !== role) {
    throw new Error("Role does not match approval stage.");
  }

  const event = await Event.findById(approval.eventId);
  if (!event) throw new Error("Event not found.");

  const stageToStatusMap: Record<string, string> = {
    faculty_advisor: "faculty_review",
    hod: "hod_review",
    admin: "admin_review",
  };

  if (event.status !== stageToStatusMap[approval.stage]) {
    throw new Error("Event is not in the correct status for this approval stage.");
  }

  approval.decision = "rejected";
  approval.comments = comments;
  approval.decidedAt = new Date();
  await approval.save();

  event.status = "rejected";
  await event.save();

  return approval;
};