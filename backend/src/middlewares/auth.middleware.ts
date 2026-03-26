import { NextFunction, Request, Response } from "express";

import { PrismaClient } from "../generated/prisma";
import { verifyAccessToken } from "../utils/auth";

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
