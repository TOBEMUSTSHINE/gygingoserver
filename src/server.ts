import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.js";
import LogsRouter from "./routes/activitieslog.js";
import academicYearRouter from "./routes/academicYear.js";
import classRouter from "./routes/class.js";
import subjectRouter from "./routes/subject.js";
import timeRouter from "./routes/timetable.js";
import examRouter from "./routes/exam.js";
import dashboardRouter from "./routes/dashboard.js";
import teamRouter from "./routes/team.js";
import analyticsRouter from "./routes/analytics.js";
import visualRouter from "./routes/visual.js";
import videoRouter from "./routes/video.js";
import topicRouter from "./routes/topic.js";
import financerouter from "./routes/finance.js";
import { forgotPassword, resetPassword } from "./controllers/passwordReset.js";
import { serve } from "inngest/express";
import { inngest } from "./inngest/index.js";
import { generateTimeTable, generateExam, handleExamSubmission } from "./inngest/functions.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
    "https://gygingo.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => res.json({ status: "OK" }));
app.use("/api/users", userRoutes);
app.use("/api/activities", LogsRouter);
app.use("/api/academic-years", academicYearRouter);
app.use("/api/classes", classRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/timetables", timeRouter);
app.use("/api/exams", examRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/teams", teamRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/visuals", visualRouter);
app.use("/api/video", videoRouter);
app.use("/api/topics", topicRouter);
app.use("/api/finance", financerouter);
app.post("/api/users/forgot-password", forgotPassword);
app.post("/api/users/reset-password/:token", resetPassword);
app.use("/api/inngest", serve({ client: inngest, functions: [generateTimeTable, generateExam, handleExamSubmission] }));

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server on port ${PORT}`);
    console.log(`🌐 Allowed CORS origins: ${allowedOrigins.join(", ")}`);
  });
});