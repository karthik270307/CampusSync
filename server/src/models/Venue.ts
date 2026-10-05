import mongoose, { Document, Schema } from "mongoose";

export interface IVenue extends Document {
  name: string;
  location: string;
  capacity: number;
  amenities: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const venueSchema = new Schema<IVenue>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    amenities: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

venueSchema.index({ capacity: 1 });

export const Venue = mongoose.model<IVenue>("Venue", venueSchema);