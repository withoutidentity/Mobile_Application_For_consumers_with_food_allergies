import { Request, Response } from "express";
import { ProductService } from "../services/product.service";

export const ProductController = {
  async getAll(req: Request, res: Response) {
    try {
      const products = await ProductService.getAll();
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const product = await ProductService.getById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  },
};
