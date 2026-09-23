import { Router } from 'express';
import {
  getImages,
  getImageById,
  getImagesByProduct,
  createImage,
  updateImage,
  updateStatus,
  setPrimaryImage,
  reorderImages,
  deleteImage,
} from './productImage.controller.js';
import { productImageUploadFields, resolveProductContext } from './productImage.middleware.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createProductImageSchema,
  updateProductImageSchema,
  reorderImagesSchema,
  updateStatusSchema,
  imageIdParamSchema,
  productIdParamSchema,
  getProductImagesQuerySchema,
} from './productImage.validation.js';

const router = Router();

// GET /api/product-master/product-images - List images with filters & pagination
router.get('/', validate(getProductImagesQuerySchema, 'query'), getImages);

// GET /api/product-master/product-images/product/:productId - Get all images for a product
router.get('/product/:productId', validate(productIdParamSchema, 'params'), getImagesByProduct);

// POST /api/product-master/product-images/reorder - Batch reorder images
router.post('/reorder', validate(reorderImagesSchema, 'body'), reorderImages);

// GET /api/product-master/product-images/:id - Get image by ID
router.get('/:id', validate(imageIdParamSchema, 'params'), getImageById);

// POST /api/product-master/product-images - Upload and create image
router.post(
  '/',
  resolveProductContext,
  productImageUploadFields,
  validate(createProductImageSchema, 'body'),
  createImage
);

// PUT /api/product-master/product-images/:id - Update image metadata
router.put(
  '/:id',
  validate(imageIdParamSchema, 'params'),
  validate(updateProductImageSchema, 'body'),
  updateImage
);

// PATCH /api/product-master/product-images/:id/status - Update active status
router.patch(
  '/:id/status',
  validate(imageIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// POST /api/product-master/product-images/:id/set-primary - Designate image as primary
router.post(
  '/:id/set-primary',
  validate(imageIdParamSchema, 'params'),
  setPrimaryImage
);

// DELETE /api/product-master/product-images/:id - Delete image & remove file from disk
router.delete('/:id', validate(imageIdParamSchema, 'params'), deleteImage);

export default router;
