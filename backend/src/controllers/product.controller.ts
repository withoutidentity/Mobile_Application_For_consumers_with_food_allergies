import { Request, Response } from "express";
import { ProductCreateInput, ProductService, ProductUpdateInput } from "../services/product.service";
import { deleteProductImageFile, toPublicProductImagePath } from "../utils/productImage";

const parseArrayField = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : undefined;
    } catch (_error) {
      return undefined;
    }
  }

  return undefined;
};

const parseBooleanField = (value: unknown) => value === true || value === "true";

const normalizeProductPayload = (req: Request): ProductCreateInput | ProductUpdateInput => {
  const imagePath = req.file ? toPublicProductImagePath(req.file.filename) : undefined;

  return {
    ...req.body,
    ingredients: parseArrayField(req.body.ingredients),
    allergenWarnings: parseArrayField(req.body.allergenWarnings),
    allergenWarningIds: parseArrayField(req.body.allergenWarningIds)?.map((id) => Number(id)),
    removeImage: parseBooleanField(req.body.removeImage),
    ...(imagePath ? { image: imagePath } : {}),
  };
};

const cleanupUploadedFile = async (req: Request) => {
  if (req.file) {
    await deleteProductImageFile(toPublicProductImagePath(req.file.filename));
  }
};

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
      const productData: ProductCreateInput = normalizeProductPayload(req) as ProductCreateInput;

      if (!productData.name || !productData.barcode || !productData.ingredients) {
        await cleanupUploadedFile(req);
        return res
          .status(400)
          .json({ message: "Missing required product fields: name, barcode, ingredients" });
      }
      if (!Array.isArray(productData.ingredients)) {
        await cleanupUploadedFile(req);
        return res.status(400).json({ message: "Ingredients must be an array of strings" });
      }
      if (
        productData.allergenWarnings !== undefined &&
        !Array.isArray(productData.allergenWarnings)
      ) {
        await cleanupUploadedFile(req);
        return res.status(400).json({ message: "Allergen warnings must be an array of strings" });
      }
      if (
        productData.allergenWarningIds !== undefined &&
        !Array.isArray(productData.allergenWarningIds)
      ) {
        await cleanupUploadedFile(req);
        return res.status(400).json({ message: "Allergen warning ids must be an array of numbers" });
      }

      const newProduct = await ProductService.create(productData);
      res.status(201).json(newProduct);
    } catch (error: any) {
      console.error("Error creating product:", error);
      await cleanupUploadedFile(req);
      if (error.code === "P2002" && error.meta?.target?.includes("barcode")) {
        return res.status(409).json({ message: "Product with this barcode already exists." });
      }
      res.status(500).json({ message: "Failed to create product", error: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const productData: ProductUpdateInput = normalizeProductPayload(req) as ProductUpdateInput;
      if (isNaN(id)) {
        await cleanupUploadedFile(req);
        return res.status(400).json({ message: "Invalid product ID" });
      }

      if (productData.ingredients && !Array.isArray(productData.ingredients)) {
        await cleanupUploadedFile(req);
        return res.status(400).json({ message: "Ingredients must be an array of strings" });
      }
      if (productData.allergenWarnings && !Array.isArray(productData.allergenWarnings)) {
        await cleanupUploadedFile(req);
        return res.status(400).json({ message: "Allergen warnings must be an array of strings" });
      }
      if (productData.allergenWarningIds && !Array.isArray(productData.allergenWarningIds)) {
        await cleanupUploadedFile(req);
        return res.status(400).json({ message: "Allergen warning ids must be an array of numbers" });
      }

      const updatedProduct = await ProductService.update(id, productData);
      if (!updatedProduct) {
        await cleanupUploadedFile(req);
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error: any) {
      console.error("Error updating product:", error);
      await cleanupUploadedFile(req);
      if (error.code === "P2002" && error.meta?.target?.includes("barcode")) {
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
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(500).json({ message: "Failed to delete product", error: error.message });
    }
  },
};
