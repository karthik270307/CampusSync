import mongoose, { Document, Schema } from "mongoose";

export type EventStatus =
  | "draft"
  | "submitted"
  | "faculty_review"
  | "hod_review"
  | "admin_review"
  | "approved"
  | "registration_open"
  | "ongoing"
  | "completed"
  | "rejected"
  | "cancelled";

export interface IEvent extends Document {
  title: string;
  description: string;

  organizerId: mongoose.Types.ObjectId;
  clubId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;

  category: string;

  venueId?: mongoose.Types.ObjectId;

  startDate: Date;
  endDate: Date;

  capacity: number;
  registeredCount: number;

  resources: {
    resourceId: mongoose.Types.ObjectId;
    quantity: number;
  }[];

  objectives: string[];
  dignitaries: string[];

  budget?: number;

  status: EventStatus;

  registrationOpen: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },

    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    venueId: {
      type: Schema.Types.ObjectId,
      ref: "Venue",
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    resources: [
      {
        resourceId: {
          type: Schema.Types.ObjectId,
          ref: "Resource",
        },

        quantity: {
          type: Number,
          min: 1,
        },
      },
    ],

    objectives: [
      {
        type: String,
        trim: true,
      },
    ],

    dignitaries: [
      {
        type: String,
        trim: true,
      },
    ],

    budget: {
      type: Number,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "faculty_review",
        "hod_review",
        "admin_review",
        "approved",
        "registration_open",
        "ongoing",
        "completed",
        "rejected",
        "cancelled",
      ],
      default: "draft",
    },

    registrationOpen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({
  venueId: 1,
  startDate: 1,
  endDate: 1,
});

eventSchema.index({
  status: 1,
});

eventSchema.index({
  category: 1,
});

eventSchema.index({
  departmentId: 1,
});

eventSchema.index({
  startDate: 1,
});

export const Event = mongoose.model<IEvent>(
  "Event",
  eventSchema
);