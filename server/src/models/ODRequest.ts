import mongoose, { Document, Schema } from "mongoose";

export type ODStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface IODRequest extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  registrationId?: mongoose.Types.ObjectId;

  status: ODStatus;

  reason: string;

  facultyId?: mongoose.Types.ObjectId;

  reviewerComments?: string;

  reviewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const odRequestSchema = new Schema<IODRequest>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    registrationId: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    facultyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    reviewerComments: {
      type: String,
      trim: true,
    },

    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

odRequestSchema.index({
  userId: 1,
  status: 1,
});

odRequestSchema.index({
  eventId: 1,
});

export const ODRequest = mongoose.model<IODRequest>(
  "ODRequest",
  odRequestSchema
);