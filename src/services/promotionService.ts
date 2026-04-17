import mongoose from "mongoose";
import Class from "../models/class.js";
import User from "../models/user.js";
import Submission from "../models/submission.js";
import Promotion from "../models/promotion.js";
import AcademicYear from "../models/academicYear.js";

export const runPromotionsForAcademicYear = async (academicYearId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const academicYear = await AcademicYear.findById(academicYearId);
    if (!academicYear) throw new Error("Academic year not found");

    const classes = await Class.find({
      promotionBenchmark: { $exists: true, $ne: null },
      nextClass: { $exists: true, $ne: null },
    }).populate("students");

    for (const cls of classes) {
      const benchmark = cls.promotionBenchmark!;
      const nextClassId = cls.nextClass;

      for (const student of cls.students) {
        const submissions = await Submission.aggregate([
          {
            $lookup: {
              from: "exams",
              localField: "exam",
              foreignField: "_id",
              as: "exam",
            },
          },
          { $unwind: "$exam" },
          {
            $match: {
              student: student._id,
              "exam.academicYear": new mongoose.Types.ObjectId(academicYearId),
            },
          },
          {
            $group: {
              _id: null,
              avgScore: { $avg: "$score" },
            },
          },
        ]);

        const avgScore = submissions.length > 0 ? submissions[0].avgScore : 0;
        const promoted = avgScore >= benchmark;

        await Promotion.create({
          student: student._id,
          fromClass: cls._id,
          toClass: promoted ? nextClassId : undefined,
          academicYear: academicYearId,
          benchmark,
          studentAverage: avgScore,
          promoted,
        });

        if (promoted) {
          await User.findByIdAndUpdate(student._id, { studentClass: nextClassId });
          await Class.findByIdAndUpdate(cls._id, { $pull: { students: student._id } });
          await Class.findByIdAndUpdate(nextClassId, { $addToSet: { students: student._id } });
        }
      }
    }

    await session.commitTransaction();
    console.log("Promotions completed for academic year", academicYearId);
  } catch (error) {
    await session.abortTransaction();
    console.error("Promotion error:", error);
  } finally {
    session.endSession();
  }
};