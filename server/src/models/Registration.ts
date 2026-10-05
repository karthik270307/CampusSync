import mongoose, { Document, Schema } from "mongoose";

export type RegistrationStatus =
  | "registered"
  | "waitlisted"
  | "cancelled"
  | "attended";

export interface IRegistration extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  status: RegistrationStatus;

  ticketToken: string;

  registeredAt: Date;
  cancelledAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
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

    status: {
      type: String,
      enum: [
        "registered",
        "waitlisted",
        "cancelled",
        "attended",
      ],
      default: "registered",
    },

    ticketToken: {
      type: String,
      required: true,
      unique: true,
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },

    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate registration for the same event
registrationSchema.index(
  { eventId: 1, userId: 1 },
  { unique: true }
);

registrationSchema.index({
  eventId: 1,
  status: 1,
});

registrationSchema.index({
  userId: 1,
  status: 1,
});

export const Registration = mongoose.model<IRegistration>(
  "Registration",
  registrationSchema
);