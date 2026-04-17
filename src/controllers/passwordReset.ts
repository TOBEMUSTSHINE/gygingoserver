import type { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/user.js";
import { sendEmail } from "../utils/sendEmail.js";

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(200).json({ message: "If that email exists, a reset link has been sent." });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password. This link is valid for 3 minutes.</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset",
        html: message,
      });
      res.status(200).json({ message: "Email sent" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      console.error(error);
      res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      res.status(400).json({ message: "Password and confirm password are required" });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    // Ensure token is a string (it always is from req.params)
    const tokenStr = Array.isArray(token) ? token[0] : token;
    const hashedToken = crypto.createHash("sha256").update(tokenStr).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};