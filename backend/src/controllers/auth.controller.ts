import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { PrismaClient } from "../generated/prisma";
import {
  PRIVACY_DOCUMENT_VERSION,
  TERMS_DOCUMENT_VERSION,
} from "../constants/consent";
import { signAccessToken, signRefreshToken } from "../utils/auth";

const prisma = new PrismaClient();

type RegisterBody = {
  email?: string;
  password?: string;
  name?: string;
  acceptedTerms?: boolean;
  acceptedPrivacyConsent?: boolean;
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
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
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
