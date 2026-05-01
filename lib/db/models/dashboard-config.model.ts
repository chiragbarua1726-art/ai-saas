import mongoose, { Schema, Document, Model } from "mongoose";
import type { Widget } from "@/lib/types";

export interface IDashboardConfig extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  widgets: Widget[];
  createdAt: Date;
  updatedAt: Date;
}

const WidgetPositionSchema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
  },
  { _id: false }
);

const WidgetSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["stats", "chart", "activity", "integrations"],
      required: true,
    },
    title: { type: String, required: true },
    config: { type: Schema.Types.Mixed, default: {} },
    position: { type: WidgetPositionSchema, required: true },
  },
  { _id: false }
);

const DashboardConfigSchema = new Schema<IDashboardConfig>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
    },
    widgets: {
      type: [WidgetSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const DashboardConfigModel: Model<IDashboardConfig> =
  mongoose.models.DashboardConfig ||
  mongoose.model<IDashboardConfig>("DashboardConfig", DashboardConfigSchema);
