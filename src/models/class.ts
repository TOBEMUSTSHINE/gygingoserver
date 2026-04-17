import mongoose, { Schema, Document } from "mongoose";

export interface IClass extends Document {
  name: string;
  academicYear: mongoose.Types.ObjectId;
  classTeacher: mongoose.Types.ObjectId;
  subjects: mongoose.Types.ObjectId[];
  students: mongoose.Types.ObjectId[];
  capacity: number;
  promotionBenchmark?: number; // new
  nextClass?: mongoose.Types.ObjectId; // new
}

const classSchema = new Schema<IClass>(
  {
    name: { type: String, required: true, trim: true },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    
    classTeacher: { type: Schema.Types.ObjectId, ref: "User", default: null },
    subjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],

    students: [{ type: Schema.Types.ObjectId, ref: "User" }],
    capacity: { type: Number, default: 40 },

    promotionBenchmark: { type: Number, min: 0, max: 100 }, // new
    nextClass: { type: Schema.Types.ObjectId, ref: "Class" }, // new
  },
  { timestamps: true }
);

classSchema.index({ name: 1, academicYear: 1 }, { unique: true });

export default mongoose.model<IClass>("Class", classSchema);