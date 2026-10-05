import mongoose, { Document, Schema } from "mongoose";

export type WaitlistStatus =
  | "waiting"
  | "notified"
  | "claimed"
  | "expired";

export interface IFacilityWaitlist extends Document {
  eventId: mongoose.Types.ObjectId;
  venueId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  position: number;
  status: WaitlistStatus;

  createdAt: Date;
  updatedAt: Date;
}

const facilityWaitlistSchema =
  new Schema<IFacilityWaitlist>(
    {
      eventId: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true,
      },

      venueId: {
        type: Schema.Types.ObjectId,
        ref: "Venue",
        required: true,
      },

      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      position: {
        type: Number,
        required: true,
        min: 1,
      },

      status: {
        type: String,
        enum: [
          "waiting",
          "notified",
          "claimed",
          "expired",
        ],
        default: "waiting",
      },
    },
    {
      timestamps: true,
    }
  );

facilityWaitlistSchema.index({
  venueId: 1,
  status: 1,
  position: 1,
});

export const FacilityWaitlist =
  mongoose.model<IFacilityWaitlist>(
    "FacilityWaitlist",
    facilityWaitlistSchema
  );