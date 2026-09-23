import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import * as productRepository from '../products/product.repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsProductsBaseDir = path.resolve(__dirname, '..', '..', '..', 'uploads', 'products');

/**
 * Configure dynamic storage with dedicated professional subfolders per product:
 * uploads/products/product-{productId}/
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const productId =
      req.body?.product_id ||
      req.params?.productId ||
      req.product?.id ||
      req.params?.id ||
      'general';

    const productFolder = `product-${productId}`;
    const targetDir = path.join(uploadsProductsBaseDir, productFolder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    req.productUploadFolder = productFolder;
    req.productUploadId = productId;
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const productId =
      req.body?.product_id ||
      req.params?.productId ||
      req.product?.id ||
      req.params?.id ||
      'gen';

    const variantId = req.body?.variant_id || req.params?.variantId || null;
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const rand = Math.random().toString(36).substring(2, 7);
    const timestamp = Date.now();

    const filename = variantId
      ? `prod-${productId}-var-${variantId}-img-${timestamp}-${rand}${ext}`
      : `prod-${productId}-img-${timestamp}-${rand}${ext}`;

    cb(null, filename);
  },
});

/**
 * Allowed image mime types
 */
const imageMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const fileFilter = (req, file, cb) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP, GIF, SVG`
      ),
      false
    );
  }
};

export const productImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const productImageUploadFields = productImageUpload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'image_url', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]);

/**
 * Middleware to preload product context onto req.product
 */
export const resolveProductContext = async (req, res, next) => {
  try {
    const productId = req.params?.productId || req.body?.product_id;
    if (productId && !req.product) {
      const product = await productRepository.findById(productId);
      if (product) {
        req.product = product;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default {
  productImageUpload,
  productImageUploadFields,
  resolveProductContext,
};
