import mongoose, { Schema, Document } from "mongoose";

export interface IVisual extends Document {
  prompt: string;
  imageUrl: string;
  thumbnailUrl?: string;
  generatedBy: mongoose.Types.ObjectId;
  isSaved: boolean;
  createdAt: Date;
}

const visualSchema = new Schema(
  {
    prompt: { type: String, required: true },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    generatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isSaved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IVisual>("Visual", visualSchema);