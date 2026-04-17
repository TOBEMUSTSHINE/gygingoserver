import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  roomId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userName: string;
  message: string;
}

const chatMessageSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "VideoRoom", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);