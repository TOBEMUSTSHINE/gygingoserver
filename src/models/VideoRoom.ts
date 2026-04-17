import mongoose, { Schema, Document } from "mongoose";

export interface IVideoRoom extends Document {
  name: string;
  createdBy: mongoose.Types.ObjectId | null;
  isActive: boolean;
  participants: string[]; // socket IDs
  endedAt?: Date;
  inviteToken?: string;
  tokenExpiresAt?: Date;
}

const videoRoomSchema = new Schema(
  {
    name: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    isActive: { type: Boolean, default: true },
    participants: [{ type: String }],
    endedAt: { type: Date },
    inviteToken: { type: String, unique: true, sparse: true },
    tokenExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IVideoRoom>("VideoRoom", videoRoomSchema);