import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import BadRequestError from '../../shared/errors/BadRequestError.js';
import { resolvePhotoFilename } from './employee.utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsBaseDir = path.resolve(__dirname, '..', '..', 'uploads', 'employees');

/**
 * Configure Multer disk storage for employee photos
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadsBaseDir)) {
      fs.mkdirSync(uploadsBaseDir, { recursive: true });
    }
    cb(null, uploadsBaseDir);
  },
  filename: (req, file, cb) => {
    const filename = resolvePhotoFilename({
      username: req.body?.username || req.user?.username,
      employeeCode: req.body?.employee_code || req.employee?.employee_code,
      firstName: req.body?.first_name || req.employee?.first_name,
      lastName: req.body?.last_name || req.employee?.last_name,
      originalname: file.originalname,
    });
    cb(null, filename);
  },
});

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const fileFilter = (req, file, cb) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP, GIF`
      ),
      false
    );
  }
};

export const employeeUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const employeePhotoUpload = employeeUpload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'profile_photo', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);

export default {
  employeeUpload,
  employeePhotoUpload,
};
