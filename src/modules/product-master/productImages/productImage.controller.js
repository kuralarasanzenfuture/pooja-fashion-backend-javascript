import * as productImageService from './productImage.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/product-images
 * List product images with pagination and filters
 */
export const getImages = async (req, res, next) => {
  try {
    const { images, pagination } = await productImageService.getProductImages(req.query);
    return sendSuccess(res, images, 'Product images retrieved successfully', 200, pagination);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/product-images/:id
 * Retrieve product image by primary key ID
 */
export const getImageById = async (req, res, next) => {
  try {
    const image = await productImageService.getProductImageById(req.params.id);
    return sendSuccess(res, image, 'Product image retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/product-images/product/:productId
 * Retrieve all images for a specific product
 */
export const getImagesByProduct = async (req, res, next) => {
  try {
    const images = await productImageService.getImagesByProductId(req.params.productId, {
      variantId: req.query.variant_id || null,
      isPrimary: req.query.is_primary !== undefined ? req.query.is_primary === 'true' : null,
      isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
    });
    return sendSuccess(res, images, 'Product images retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/product-images
 * Upload and create a new product image
 */
export const createImage = async (req, res, next) => {
  try {
    const uploadedFile =
      req.file ||
      req.files?.image?.[0] ||
      req.files?.image_url?.[0] ||
      req.files?.file?.[0] ||
      null;

    const data = {
      ...req.body,
      created_by: req.user?.id || req.body.created_by,
    };

    const image = await productImageService.createProductImage(data, uploadedFile);
    return sendCreated(res, image, 'Product image created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/product-master/product-images/:id
 * Update product image metadata
 */
export const updateImage = async (req, res, next) => {
  try {
    const image = await productImageService.updateProductImage(req.params.id, req.body);
    return sendSuccess(res, image, 'Product image updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/product-images/:id/status
 * Update image active status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const image = await productImageService.updateStatus(req.params.id, req.body.is_active);
    return sendSuccess(res, image, 'Product image status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/product-images/:id/set-primary
 * Designate image as primary
 */
export const setPrimaryImage = async (req, res, next) => {
  try {
    const image = await productImageService.setPrimaryImage(req.params.id);
    return sendSuccess(res, image, 'Primary product image set successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/product-images/reorder
 * Batch reorder images
 */
export const reorderImages = async (req, res, next) => {
  try {
    const result = await productImageService.reorderImages(req.body.items);
    return sendSuccess(res, result, 'Product images reordered successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/product-images/:id
 * Delete product image and remove its physical file from disk
 */
export const deleteImage = async (req, res, next) => {
  try {
    const result = await productImageService.deleteProductImage(req.params.id);
    return sendSuccess(res, result, 'Product image deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getImages,
  getImageById,
  getImagesByProduct,
  createImage,
  updateImage,
  updateStatus,
  setPrimaryImage,
  reorderImages,
  deleteImage,
};
