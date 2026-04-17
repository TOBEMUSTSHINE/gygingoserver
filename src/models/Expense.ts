import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  date: Date;
  category: "salary" | "utilities" | "maintenance" | "supplies" | "other";
  description: string;
  amount: number;
  academicYear: mongoose.Types.ObjectId;
}

const expenseSchema = new Schema<IExpense>(
  {
    date: { type: Date, required: true },
    category: { type: String, enum: ["salary", "utilities", "maintenance", "supplies", "other"], required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IExpense>("Expense", expenseSchema);