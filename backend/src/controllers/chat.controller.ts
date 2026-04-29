import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export const ChatController = {
  async chat(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { message, barcode, userAllergenIds } = req.body as {
        message?: string;
        barcode?: string;
        userAllergenIds?: number[];
      };

      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Missing or invalid message" });
      }

      if (barcode && typeof barcode !== "string") {
        return res.status(400).json({ message: "Invalid barcode" });
      }

      if (userAllergenIds && !Array.isArray(userAllergenIds)) {
        return res.status(400).json({ message: "Invalid userAllergenIds" });
      }

      const result = await ChatService.handleChat({
        message,
        barcode,
        userAllergenIds: userAllergenIds ?? [],
      });

      await prisma.chatMessage.createMany({
        data: [
          {
            userId: req.user.id,
            sender: "USER",
            text: message.trim(),
          },
          {
            userId: req.user.id,
            sender: "BOT",
            text: result.reply,
            safety: result.mode === "PRODUCT" ? result.safety : null,
          },
        ],
      });

      res.json(result);
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Chat processing failed", error: error.message });
    }
  },

  async getHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const messages = await prisma.chatMessage.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "asc" },
      });

      res.json(messages);
    } catch (error: any) {
      console.error("Get chat history error:", error);
      res.status(500).json({ message: "Failed to load chat history", error: error.message });
    }
  },
};
