import mongoose, { Schema, Document } from "mongoose";

export interface ITeam extends Document {
  name: string;
  logo?: string; // optional logo URL or icon name
  members: mongoose.Types.ObjectId[]; // user IDs who belong to this team
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITeam>("Team", teamSchema);