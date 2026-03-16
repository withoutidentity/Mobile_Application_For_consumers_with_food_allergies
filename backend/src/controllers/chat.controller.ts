import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";

export const ChatController = {
  async chat(req: Request, res: Response) {
    try {
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

      res.json(result);
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Chat processing failed", error: error.message });
    }
  },
};
