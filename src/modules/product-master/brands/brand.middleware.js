import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { toSlug } from '../../../shared/utils/file.js';
import * as brandRepository from './brand.repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsBaseDir = path.resolve(__dirname, '..', '..', '..', 'uploads', 'brands');

/**
 * Configure dynamic storage for brand logos in brand-specific subfolders
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const brandName =
      req.body?.brand_name ||
      req.body?.brand_code ||
      req.brand?.brand_name ||
      req.brand?.brand_code ||
      req.params?.id ||
      'general';

    const brandSlug = toSlug(brandName);
    const targetDir = path.join(uploadsBaseDir, brandSlug);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    req.brandUploadSlug = brandSlug;
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const brandName =
      req.body?.brand_name ||
      req.body?.brand_code ||
      req.brand?.brand_name ||
      req.brand?.brand_code ||
      req.params?.id ||
      'brand';

    const brandSlug = toSlug(brandName);
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const filename = `${brandSlug}-logo-${Date.now()}${ext}`;
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

export const brandUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const brandLogoUploadFields = brandUpload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'logo_url', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);

/**
 * Middleware to preload brand entity onto req.brand if req.params.id is present.
 */
export const resolveBrandContext = async (req, res, next) => {
  try {
    if (req.params?.id && !req.brand) {
      const brand = await brandRepository.findById(req.params.id);
      if (brand) {
        req.brand = brand;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default {
  brandUpload,
  brandLogoUploadFields,
  resolveBrandContext,
};
