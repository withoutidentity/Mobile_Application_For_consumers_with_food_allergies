import multer from 'multer';
import path from 'path';
import { ensureProductUploadsDir, productUploadsDir } from '../utils/productImage';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureProductUploadsDir();
    cb(null, productUploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const safeBaseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .slice(0, 50);

    cb(null, `${Date.now()}-${safeBaseName || 'product'}${ext.toLowerCase()}`);
  },
});

export const productImageUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Only JPG, PNG, and WEBP image files are allowed'));
  },
});
