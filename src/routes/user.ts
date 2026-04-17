import express from "express";

const userRoutes = express.Router();

import {
  register,
  publicRegister,
  login,
  updateUser,
  deleteUser,
  logoutUser,
  getUserProfile,
  getUsers,
} from "../controllers/user.js";

import { protect, authorize } from "../middleware/auth.js";

// PUBLIC ROUTES
userRoutes.post("/public/register", publicRegister);
userRoutes.post("/login", login);

// PROTECTED ROUTES
userRoutes.post("/logout", logoutUser);

userRoutes.get("/profile", protect, getUserProfile);

userRoutes.post("/register", protect, authorize(["admin", "teacher"]), register);

userRoutes.get("/", protect, authorize(["admin", "teacher"]), getUsers);

userRoutes.put("/update/:id", protect, authorize(["admin", "teacher"]), updateUser);

userRoutes.delete("/delete/:id", protect, authorize(["admin", "teacher"]), deleteUser);

export default userRoutes;