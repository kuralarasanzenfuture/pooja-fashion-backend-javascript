import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { toSlug } from '../../../shared/utils/file.js';
import * as subCategoryRepository from './subCategory.repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsBaseDir = path.resolve(__dirname, '..', '..', '..', 'uploads', 'subcategories');

/**
 * Configure dynamic storage for subcategory images in subcategory-specific subfolders
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subcategoryName =
      req.body?.subcategory_name ||
      req.body?.subcategory_code ||
      req.subcategory?.subcategory_name ||
      req.subcategory?.subcategory_code ||
      req.params?.id ||
      'general';

    const subcategorySlug = toSlug(subcategoryName);
    const targetDir = path.join(uploadsBaseDir, subcategorySlug);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    req.subcategoryUploadSlug = subcategorySlug;
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const subcategoryName =
      req.body?.subcategory_name ||
      req.body?.subcategory_code ||
      req.subcategory?.subcategory_name ||
      req.subcategory?.subcategory_code ||
      req.params?.id ||
      'subcategory';

    const subcategorySlug = toSlug(subcategoryName);
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const filename = `${subcategorySlug}-image-${Date.now()}${ext}`;
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

export const subCategoryUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const subCategoryImageUploadFields = subCategoryUpload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'image_url', maxCount: 1 },
]);

/**
 * Middleware to preload subcategory entity onto req.subcategory if req.params.id is present.
 */
export const resolveSubcategoryContext = async (req, res, next) => {
  try {
    if (req.params?.id && !req.subcategory) {
      const subcategory = await subCategoryRepository.findById(req.params.id);
      if (subcategory) {
        req.subcategory = subcategory;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default {
  subCategoryUpload,
  subCategoryImageUploadFields,
  resolveSubcategoryContext,
};
