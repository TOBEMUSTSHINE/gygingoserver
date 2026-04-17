import mongoose, { Schema, Document } from "mongoose";

export interface ITopic extends Document {
  title: string;
  outline: string[];
  content: Map<string, string>;
  createdBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const topicSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    outline: [{ type: String }],
    content: { type: Map, of: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITopic>("Topic", topicSchema);