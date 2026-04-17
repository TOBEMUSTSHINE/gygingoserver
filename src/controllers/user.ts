import type { Request, Response } from "express";
import User from "../models/user.js";
import { generateToken } from "../utils/generateToken.js";
import { logActivity } from "../utils/activitieslog.js";
import type { AuthRequest } from "../middleware/auth.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, studentClass, teacherSubject, isActive } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      studentClass,
      teacherSubject,
      isActive,
    });

    if (newUser) {
      if ((req as any).user) {
        await logActivity({
          userId: (req as any).user._id,
          action: "Registered User",
          details: `Registered user with email: ${newUser.email}`,
        });
      }
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        studentClass: newUser.studentClass,
        teacherSubject: newUser.teacherSubject,
        message: "User registered successfully",
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const publicRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const assignedRole = "student";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      isActive: true,
      studentClass: null,
      teacherSubject: null,
    });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      message: "Registration successful. Please login.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(user.id.toString(), res);
      res.json(user);
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;
      user.studentClass = req.body.studentClass || user.studentClass;
      user.teacherSubject = req.body.teacherSubject || user.teacherSubject;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();

      if ((req as any).user) {
        await logActivity({
          userId: (req as any).user._id.toString(),
          action: "Updated User",
          details: `Updated user with email: ${updatedUser.email}`,
        });
      }
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        studentClass: updatedUser.studentClass,
        teacherSubject: updatedUser.teacherSubject,
        message: "User updated successfully",
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;
    const filter: any = {};

    if (role && role !== "all" && role !== "") {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      if ((req as any).user) {
        await logActivity({
          userId: (req as any).user._id.toString(),
          action: "Deleted User",
          details: `Deleted user with email: ${user.email}`,
        });
      }
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      res.json({
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      });
    } else {
      res.status(401).json({ message: "Not authorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};