import mongoose, { Document, Schema } from "mongoose";

export type ApprovalStage =
  | "faculty_advisor"
  | "hod"
  | "admin";

export type ApprovalDecision =
  | "pending"
  | "approved"
  | "revision_requested"
  | "rejected";

export interface IApproval extends Document {
  eventId: mongoose.Types.ObjectId;

  stage: ApprovalStage;

  assignedTo?: mongoose.Types.ObjectId;

  decision: ApprovalDecision;

  comments?: string;

  decidedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const approvalSchema = new Schema<IApproval>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    stage: {
      type: String,
      enum: ["faculty_advisor", "hod", "admin"],
      required: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    decision: {
      type: String,
      enum: [
        "pending",
        "approved",
        "revision_requested",
        "rejected",
      ],
      default: "pending",
    },

    comments: {
      type: String,
      trim: true,
    },

    decidedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Helps find all approval stages for an event
approvalSchema.index({
  eventId: 1,
});

// Prevents duplicate approval records
// for the same event and approval stage.
approvalSchema.index(
  {
    eventId: 1,
    stage: 1,
  },
  {
    unique: true,
  }
);

// Helps find approvals assigned to a particular faculty/HOD/admin
approvalSchema.index({
  assignedTo: 1,
  decision: 1,
});

export const Approval = mongoose.model<IApproval>(
  "Approval",
  approvalSchema
);