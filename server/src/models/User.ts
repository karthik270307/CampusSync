import mongoose, { Document, Schema } from "mongoose";

export type UserRole =
  | "student"
  | "club_organizer"
  | "faculty_advisor"
  | "hod"
  | "dean"
  | "venue_admin"
  | "admin"
  | "super_admin";

export type AccountStatus = 
  | "pending_verification"
  | "active"
  | "rejected"
  | "resubmission_required"
  | "suspended";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  departmentId?: mongoose.Types.ObjectId;
  registerNumber?: string;
  employeeId?: string;
  phone?: string;
  googleId?: string;
  avatarUrl?: string;
  isActive: boolean;
  accountStatus: AccountStatus;
  verificationDocumentUrl?: string;
  verificationSubmittedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  verificationComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "student",
        "club_organizer",
        "faculty_advisor",
        "hod",
        "dean",
        "venue_admin",
        "admin",
        "super_admin",
      ],
      required: true,
    },

    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },

    registerNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    employeeId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    avatarUrl: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    accountStatus: {
      type: String,
      enum: [
        "pending_verification",
        "active",
        "rejected",
        "resubmission_required",
        "suspended",
      ],
      default: "active",
    },

    verificationDocumentUrl: {
      type: String,
    },

    verificationSubmittedAt: {
      type: Date,
    },

    verifiedAt: {
      type: Date,
    },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    verificationComments: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ departmentId: 1 });

export const User = mongoose.model<IUser>("User", userSchema);