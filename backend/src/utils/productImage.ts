import fs from 'fs';
import path from 'path';

export const productUploadsDir = path.resolve(process.cwd(), 'uploads', 'products');
const uploadsRootDir = path.resolve(process.cwd(), 'uploads');
const publicUploadsPrefix = '/uploads/products/';

export const ensureProductUploadsDir = () => {
  if (!fs.existsSync(productUploadsDir)) {
    fs.mkdirSync(productUploadsDir, { recursive: true });
  }
};

export const ensureUploadsRootDir = () => {
  if (!fs.existsSync(uploadsRootDir)) {
    fs.mkdirSync(uploadsRootDir, { recursive: true });
  }
};

export const toPublicProductImagePath = (filename: string) => `${publicUploadsPrefix}${filename}`;

export const deleteProductImageFile = async (imageUrl?: string | null) => {
  if (!imageUrl || !imageUrl.startsWith(publicUploadsPrefix)) {
    return;
  }

  const filename = imageUrl.slice(publicUploadsPrefix.length);
  const filePath = path.resolve(productUploadsDir, filename);

  if (!filePath.startsWith(productUploadsDir)) {
    return;
  }

  try {
    await fs.promises.unlink(filePath);
  } catch (error: any) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
  }
};
