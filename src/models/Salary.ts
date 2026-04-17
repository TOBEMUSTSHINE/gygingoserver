import mongoose, { Schema, Document } from "mongoose";

export interface ISalary extends Document {
  employee: mongoose.Types.ObjectId;
  amount: number;
  month: number; // 1-12
  year: number;
  status: "paid" | "pending";
  paymentDate?: Date;
  academicYear: mongoose.Types.ObjectId;
}

const salarySchema = new Schema<ISalary>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    status: { type: String, enum: ["paid", "pending"], default: "pending" },
    paymentDate: { type: Date },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISalary>("Salary", salarySchema);