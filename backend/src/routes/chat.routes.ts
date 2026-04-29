import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken);
router.post("/", ChatController.chat);
router.get("/history", ChatController.getHistory);

export default router;
