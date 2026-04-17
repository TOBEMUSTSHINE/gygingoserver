import mongoose, { Schema, Document } from "mongoose";

export interface IPromotion extends Document {
  student: mongoose.Types.ObjectId;
  fromClass: mongoose.Types.ObjectId;
  toClass?: mongoose.Types.ObjectId;
  academicYear: mongoose.Types.ObjectId;
  benchmark: number;
  studentAverage: number;
  promoted: boolean;
  createdAt: Date;
}

const promotionSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  fromClass: { type: Schema.Types.ObjectId, ref: "Class", required: true },
  toClass: { type: Schema.Types.ObjectId, ref: "Class" },
  academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
  benchmark: { type: Number, required: true },
  studentAverage: { type: Number, required: true },
  promoted: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPromotion>("Promotion", promotionSchema);