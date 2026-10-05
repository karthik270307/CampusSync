import mongoose, { Document, Schema } from "mongoose";

export type CalendarType =
  | "exam"
  | "holiday"
  | "mandatory_event"
  | "other";

export interface IAcademicCalendar extends Document {
  title: string;
  type: CalendarType;
  startDate: Date;
  endDate: Date;
  description?: string;
  isBlocking: boolean;
  isRestricted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const academicCalendarSchema = new Schema<IAcademicCalendar>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["exam", "holiday", "mandatory_event", "other"],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    isBlocking: {
      type: Boolean,
      default: true,
    },

    isRestricted: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

academicCalendarSchema.index({
  startDate: 1,
  endDate: 1,
});

export const AcademicCalendar = mongoose.model<IAcademicCalendar>(
  "AcademicCalendar",
  academicCalendarSchema
);