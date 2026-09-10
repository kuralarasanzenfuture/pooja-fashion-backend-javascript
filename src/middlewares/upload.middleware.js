import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import BadRequestError from '../shared/errors/BadRequestError.js';
import { toSlug } from '../shared/utils/file.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsBaseDir = path.resolve(__dirname, '..', 'uploads', 'banks');

/**
 * Configure dynamic storage for bank logos in bank-specific subfolders
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine bank identifier/name for folder
    const bankName =
      req.body?.bank_name ||
      req.body?.bank_code ||
      req.bank?.bank_name ||
      req.bank?.bank_code ||
      req.params?.id ||
      'general';

    const bankSlug = toSlug(bankName);
    const targetDir = path.join(uploadsBaseDir, bankSlug);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Attach target slug to request for downstream controller usage
    req.bankUploadSlug = bankSlug;
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const bankName =
      req.body?.bank_name ||
      req.body?.bank_code ||
      req.bank?.bank_name ||
      req.bank?.bank_code ||
      req.params?.id ||
      'bank';

    const bankSlug = toSlug(bankName);
    const ext = path.extname(file.originalname).toLowerCase() || '.png';

    let suffix = 'logo';
    if (file.fieldname === 'logo_light' || file.fieldname === 'logoLight') {
      suffix = 'logo-light';
    } else if (file.fieldname === 'logo_dark' || file.fieldname === 'logoDark') {
      suffix = 'logo-dark';
    }

    const filename = `${bankSlug}-${suffix}-${Date.now()}${ext}`;
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

export const bankUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const bankLogoUploadFields = bankUpload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'logo_light', maxCount: 1 },
  { name: 'logo_dark', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);

export default {
  bankUpload,
  bankLogoUploadFields,
};
