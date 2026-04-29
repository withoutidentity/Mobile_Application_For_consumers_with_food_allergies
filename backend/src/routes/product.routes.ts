import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { productImageUpload } from "../middlewares/productImageUpload";

const router = Router();

router.get("/", ProductController.getAll);
router.get("/:id", ProductController.getById);
router.post("/", productImageUpload.single("image"), ProductController.create);
router.put("/:id", productImageUpload.single("image"), ProductController.update);
router.delete("/:id", ProductController.remove);

export default router;
