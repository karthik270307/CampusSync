import mongoose, { Document, Schema } from "mongoose";

export type ConsentStatus =
  | "pending"
  | "given"
  | "declined";

export interface IConsent extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  parentName?: string;
  parentPhone?: string;

  status: ConsentStatus;

  submittedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const consentSchema = new Schema<IConsent>(
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

    parentName: {
      type: String,
      trim: true,
    },

    parentPhone: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "given", "declined"],
      default: "pending",
    },

    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

consentSchema.index(
  { eventId: 1, userId: 1 },
  { unique: true }
);

export const Consent = mongoose.model<IConsent>(
  "Consent",
  consentSchema
);