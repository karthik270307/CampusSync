import mongoose, { Document, Schema } from "mongoose";

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;

  action: string;

  entityType: string;

  entityId?: mongoose.Types.ObjectId;

  metadata?: Record<string, unknown>;

  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    entityType: {
      type: String,
      required: true,
      trim: true,
    },

    entityId: {
      type: Schema.Types.ObjectId,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

auditLogSchema.index({
  entityType: 1,
  entityId: 1,
});

auditLogSchema.index({
  userId: 1,
  createdAt: -1,
});

export const AuditLog = mongoose.model<IAuditLog>(
  "AuditLog",
  auditLogSchema
);