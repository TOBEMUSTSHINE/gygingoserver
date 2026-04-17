import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { type IUser, type userRoles } from "../models/user.js";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      req.user = (await User.findById(decoded.userId).select("-password")) as IUser;
      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const authorize = (roles: userRoles[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized, user not found" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
      return;
    }

    next();
  };
};