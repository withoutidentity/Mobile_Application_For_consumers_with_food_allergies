import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { PrismaClient } from "../generated/prisma";
import {
  PRIVACY_DOCUMENT_VERSION,
  TERMS_DOCUMENT_VERSION,
} from "../constants/consent";
import { signAccessToken, signRefreshToken } from "../utils/auth";
import { sendPasswordResetCodeEmail } from "../services/email.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const prisma = new PrismaClient();

type RegisterBody = {
  email?: string;
  password?: string;
  name?: string;
  acceptedTerms?: boolean;
  acceptedPrivacyConsent?: boolean;
};

type ForgotPasswordBody = {
  email?: string;
};

type ResetPasswordBody = {
  email?: string;
  code?: string;
  newPassword?: string;
};

type ChangePasswordBody = {
  currentPassword?: string;
  newPassword?: string;
};

const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const validatePassword = (password?: string) => {
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
};

const getRequestIp = (req: Request) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0];
  }

  return req.ip ?? null;
};

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      name,
      acceptedTerms,
      acceptedPrivacyConsent,
    } = req.body as RegisterBody;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Missing required registration fields" });
    }

    if (!acceptedTerms || !acceptedPrivacyConsent) {
      return res.status(400).json({
        message: "You must accept the terms and privacy consent before registering",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const ipAddress = getRequestIp(req);
    const userAgent = req.get("user-agent") ?? null;

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          updatedAt: new Date(),
        },
      });

      await tx.$executeRaw`
        INSERT INTO "consent_logs"
          ("user_id", "consent_type", "consent_status", "document_version", "ip_address", "user_agent")
        VALUES
          (${createdUser.id}, CAST('TOS' AS "ConsentType"), CAST('GRANTED' AS "ConsentStatus"), ${TERMS_DOCUMENT_VERSION}, ${ipAddress}, ${userAgent}),
          (${createdUser.id}, CAST('PRIVACY_POLICY' AS "ConsentType"), CAST('GRANTED' AS "ConsentStatus"), ${PRIVACY_DOCUMENT_VERSION}, ${ipAddress}, ${userAgent}),
          (${createdUser.id}, CAST('SENSITIVE_HEALTH_DATA' AS "ConsentType"), CAST('GRANTED' AS "ConsentStatus"), ${PRIVACY_DOCUMENT_VERSION}, ${ipAddress}, ${userAgent})
      `;

      return createdUser;
    });

    return res.json({ message: "User registered", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Login failed" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as ForgotPasswordBody;

    if (!email?.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({ message: "ไม่พบอีเมลในระบบ" });
    }

    const code = generateResetCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await tx.passwordResetCode.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      await tx.passwordResetCode.create({
        data: {
          userId: user.id,
          code,
          expiresAt,
        },
      });
    });

    const emailSent = await sendPasswordResetCodeEmail(user.email, code);

    return res.status(200).json({
      message: emailSent
        ? "A reset code has been sent"
        : "Reset code generated. Configure SMTP to send real emails.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to send password reset code" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body as ResetPasswordBody;
    const passwordError = validatePassword(newPassword);

    if (!email?.trim() || !code?.trim()) {
      return res.status(400).json({ message: "Email and reset code are required" });
    }

    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    const resetCode = await prisma.passwordResetCode.findFirst({
      where: {
        userId: user.id,
        code: code.trim(),
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!resetCode) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    const hashedPassword = await bcrypt.hash(newPassword!, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          refreshToken: null,
        },
      });

      await tx.passwordResetCode.update({
        where: { id: resetCode.id },
        data: {
          usedAt: new Date(),
        },
      });
    });

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to reset password" });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body as ChangePasswordBody;
    const passwordError = validatePassword(newPassword);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required" });
    }

    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword!, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        refreshToken: null,
      },
    });

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to change password" });
  }
};
