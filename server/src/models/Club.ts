import mongoose, { Document, Schema } from "mongoose";

export interface IClub extends Document {
  name: string;
  code: string;
  description?: string;
  departmentId?: mongoose.Types.ObjectId;
  facultyAdvisorId?: mongoose.Types.ObjectId;
  organizerIds: mongoose.Types.ObjectId[];
  memberIds: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const clubSchema = new Schema<IClub>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },

    facultyAdvisorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    organizerIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    memberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
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

export const Club = mongoose.model<IClub>("Club", clubSchema);