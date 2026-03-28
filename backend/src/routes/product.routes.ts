import { Router } from "express";
import { ProductController } from "../controllers/product.controller";

const router = Router();

router.get("/", ProductController.getAll);
router.get("/:id", ProductController.getById);
router.post("/", ProductController.create); // Route สำหรับสร้าง Product ใหม่
router.put("/:id", ProductController.update); // Route สำหรับอัปเดต Product
router.delete("/:id", ProductController.remove); // Route สำหรับลบ Product

export default router;
