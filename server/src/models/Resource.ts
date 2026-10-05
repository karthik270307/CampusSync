import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ResourceCategory =
  | "audio_visual"
  | "it_equipment"
  | "furniture"
  | "lighting"
  | "electrical"
  | "stage_props"
  | "sports_gear"
  | "other";

export type ResourceCondition =
  | "excellent"
  | "good"
  | "fair"
  | "under_maintenance";

export interface IResource {
  name: string;
  category: ResourceCategory;
  description?: string;
  totalQuantity: number;
  availableQuantity: number;
  inCharge?: Types.ObjectId;
  condition: ResourceCondition;
  requiresApproval: boolean;
  location?: string;
  serialNumbers: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResourceDocument extends IResource, Document {
  _id: Types.ObjectId;
}

const resourceSchema = new Schema<IResourceDocument>(
  {
    name: {
      type: String,
      required: [true, "Resource name is required"],
      trim: true,
      maxlength: [100, "Resource name cannot exceed 100 characters"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "audio_visual",
        "it_equipment",
        "furniture",
        "lighting",
        "electrical",
        "stage_props",
        "sports_gear",
        "other",
      ],
      default: "audio_visual",
      index: true,
    },
    totalQuantity: {
      type: Number,
      required: [true, "Total quantity is required"],
      min: [1, "Total quantity must be at least 1"],
    },
    availableQuantity: {
      type: Number,
      required: [true, "Available quantity is required"],
      min: [0, "Available quantity cannot be negative"],
      validate: {
        validator: function (this: any, val: number) {
          return this.totalQuantity === undefined || val <= this.totalQuantity;
        },
        message: "Available quantity cannot exceed total quantity",
      },
    },
    inCharge: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "under_maintenance"],
      default: "good",
    },
    requiresApproval: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      trim: true,
    },
    serialNumbers: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Resource: Model<IResourceDocument> =
  mongoose.models.Resource ||
  mongoose.model<IResourceDocument>("Resource", resourceSchema);

export default Resource;
