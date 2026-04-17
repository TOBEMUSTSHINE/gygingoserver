import mongoose, { Schema, Document } from "mongoose";

export interface IFee extends Document {
  student: mongoose.Types.ObjectId;
  amount: number;
  dueDate: Date;
  status: "paid" | "pending" | "overdue";
  paymentDate?: Date;
  academicYear: mongoose.Types.ObjectId;
  description?: string;
}

const feeSchema = new Schema<IFee>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["paid", "pending", "overdue"], default: "pending" },
    paymentDate: { type: Date },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IFee>("Fee", feeSchema);