import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { toSlug } from '../../../shared/utils/file.js';
import * as categoryRepository from './category.repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsBaseDir = path.resolve(__dirname, '..', '..', '..', 'uploads', 'categories');

/**
 * Configure dynamic storage for category images in category-specific subfolders
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const categoryName =
      req.body?.category_name ||
      req.body?.category_code ||
      req.category?.category_name ||
      req.category?.category_code ||
      req.params?.id ||
      'general';

    const categorySlug = toSlug(categoryName);
    const targetDir = path.join(uploadsBaseDir, categorySlug);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    req.categoryUploadSlug = categorySlug;
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const categoryName =
      req.body?.category_name ||
      req.body?.category_code ||
      req.category?.category_name ||
      req.category?.category_code ||
      req.params?.id ||
      'category';

    const categorySlug = toSlug(categoryName);
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const filename = `${categorySlug}-image-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

/**
 * Allowed image mime types
 */
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];

const fileFilter = (req, file, cb) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP, SVG, GIF`
      ),
      false
    );
  }
};

export const categoryUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const categoryImageUploadFields = categoryUpload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'image_url', maxCount: 1 },
]);

/**
 * Middleware to preload category entity onto req.category if req.params.id is present.
 */
export const resolveCategoryContext = async (req, res, next) => {
  try {
    if (req.params?.id && !req.category) {
      const category = await categoryRepository.findById(req.params.id);
      if (category) {
        req.category = category;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default {
  categoryUpload,
  categoryImageUploadFields,
  resolveCategoryContext,
};
