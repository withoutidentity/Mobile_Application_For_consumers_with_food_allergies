import { Request, Response } from "express";
import { ProductService, ProductCreateInput, ProductUpdateInput } from "../services/product.service";

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

  async create(req: Request, res: Response) {
    try {
      const productData: ProductCreateInput = req.body;
      // ตรวจสอบข้อมูลเบื้องต้น
      if (!productData.name || !productData.barcode || !productData.ingredients) {
        return res.status(400).json({ message: "Missing required product fields: name, barcode, ingredients" });
      }
      // ตรวจสอบว่า ingredients เป็น array
      if (!Array.isArray(productData.ingredients)) {
        return res.status(400).json({ message: "Ingredients must be an array of strings" });
      }
      // ตรวจสอบว่า allergenWarnings เป็น array
      if (!Array.isArray(productData.allergenWarnings)) {
        return res.status(400).json({ message: "Allergen warnings must be an array of strings" });
      }

      const newProduct = await ProductService.create(productData);
      res.status(201).json(newProduct);
    } catch (error: any) {
      console.error("Error creating product:", error);
      // ตรวจจับ error กรณี barcode ซ้ำ
      if (error.code === 'P2002' && error.meta?.target?.includes('barcode')) {
        return res.status(409).json({ message: "Product with this barcode already exists." });
      }
      res.status(500).json({ message: "Failed to create product", error: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const productData: ProductUpdateInput = req.body;
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      // ตรวจสอบประเภทข้อมูลสำหรับฟิลด์ที่เป็น array หากมีการส่งมา
      if (productData.ingredients && !Array.isArray(productData.ingredients)) {
        return res.status(400).json({ message: "Ingredients must be an array of strings" });
      }
      if (productData.allergenWarnings && !Array.isArray(productData.allergenWarnings)) {
        return res.status(400).json({ message: "Allergen warnings must be an array of strings" });
      }

      const updatedProduct = await ProductService.update(id, productData);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error: any) {
      console.error("Error updating product:", error);
      if (error.code === 'P2002' && error.meta?.target?.includes('barcode')) {
        return res.status(409).json({ message: "Product with this barcode already exists." });
      }
      res.status(500).json({ message: "Failed to update product", error: error.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      await ProductService.remove(id);
      res.status(204).send(); // ส่งสถานะ 204 No Content เมื่อลบสำเร็จ
    } catch (error: any) {
      console.error("Error deleting product:", error);
      if (error.code === 'P2025') { // Prisma error code สำหรับ record not found
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(500).json({ message: "Failed to delete product", error: error.message });
    }
  },
};
