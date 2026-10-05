import mongoose, { Document, Schema } from "mongoose";

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "approval"
  | "registration"
  | "facility"
  | "od";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;

  title: string;
  message: string;

  type: NotificationType;

  link?: string;

  isRead: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema =
  new Schema<INotification>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
      },

      type: {
        type: String,
        enum: [
          "info",
          "success",
          "warning",
          "approval",
          "registration",
          "facility",
          "od",
        ],
        default: "info",
      },

      link: {
        type: String,
      },

      isRead: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

notificationSchema.index({
  userId: 1,
  isRead: 1,
  createdAt: -1,
});

export const Notification =
  mongoose.model<INotification>(
    "Notification",
    notificationSchema
  );