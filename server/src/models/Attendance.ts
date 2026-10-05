import mongoose, { Document, Schema } from "mongoose";

export interface IAttendance extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  registrationId?: mongoose.Types.ObjectId;
  scannedBy?: mongoose.Types.ObjectId;

  verificationMethod: "qr_scan" | "manual";

  scannedAt: Date;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
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

    scannedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    verificationMethod: {
      type: String,
      enum: ["qr_scan", "manual"],
      default: "qr_scan",
    },

    scannedAt: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// A student can only have one attendance record for an event.
attendanceSchema.index(
  { eventId: 1, userId: 1 },
  { unique: true }
);

attendanceSchema.index({
  eventId: 1,
  scannedAt: 1,
});

export const Attendance = mongoose.model<IAttendance>(
  "Attendance",
  attendanceSchema
);