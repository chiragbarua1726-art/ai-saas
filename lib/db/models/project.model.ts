import mongoose, { Schema, Document, Model } from "mongoose";
import type { Integrations } from "@/lib/types";

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  ownerId: mongoose.Types.ObjectId;
  memberIds: mongoose.Types.ObjectId[];
  integrations: Integrations;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationsSchema = new Schema(
  {
    crm: { type: Boolean, default: false },
    shopify: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    integrations: {
      type: IntegrationsSchema,
      default: () => ({ crm: false, shopify: false }),
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user-project lookups
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ memberIds: 1 });

export const ProjectModel: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
