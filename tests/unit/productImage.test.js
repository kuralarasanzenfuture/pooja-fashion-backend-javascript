import { extractUploadedImage } from '../../src/modules/product-master/productImages/productImage.service.js';
import {
  toProductImageDTO,
  toProductImageListDTO,
} from '../../src/modules/product-master/productImages/productImage.mapper.js';
import {
  createProductImageSchema,
  updateProductImageSchema,
  reorderImagesSchema,
  updateStatusSchema,
  setPrimaryImageSchema,
  imageIdParamSchema,
  productIdParamSchema,
  getProductImagesQuerySchema,
} from '../../src/modules/product-master/productImages/productImage.validation.js';

describe('Product Master: Product Images Unit Tests', () => {
  describe('extractUploadedImage', () => {
    it('should extract metadata with professional per-product subfolder', () => {
      const mockFile = {
        filename: 'prod-1-img-12345.jpg',
        originalname: 'anarkali-suit.jpg',
        mimetype: 'image/jpeg',
        size: 512000,
      };

      const extracted = extractUploadedImage({ image: [mockFile] }, 1);
      expect(extracted.image_url).toBe('/uploads/products/product-1/prod-1-img-12345.jpg');
      expect(extracted.image_key).toBe('products/product-1/prod-1-img-12345.jpg');
      expect(extracted.original_file_name).toBe('anarkali-suit.jpg');
      expect(extracted.mime_type).toBe('image/jpeg');
      expect(extracted.file_size).toBe(512000);
    });

    it('should return empty object if files is null or empty', () => {
      expect(extractUploadedImage(null, 1)).toEqual({});
      expect(extractUploadedImage({}, 1)).toEqual({});
    });
  });

  describe('Product Image Mapper', () => {
    it('should map database entity to client DTO format with nested relations', () => {
      const dbRow = {
        id: '20',
        company_id: '1',
        company_name: 'Pooja Fashion Retail Ltd',
        company_code: 'PF-CORP',
        product_id: '5',
        product_name: 'Silk Anarkali Suit',
        product_code: 'SILK_ANK_01',
        variant_id: '2',
        variant_sku: 'SILK-ANK-M-RED',
        variant_name: 'Silk Anarkali - M / Red',
        image_url: '/uploads/products/product-5/prod-5-var-2-img-123.jpg',
        image_key: 'products/product-5/prod-5-var-2-img-123.jpg',
        original_file_name: 'anarkali.jpg',
        mime_type: 'image/jpeg',
        file_size: '350000',
        width: 1200,
        height: 1600,
        alt_text: 'Silk Anarkali Front View',
        display_order: '0',
        is_primary: true,
        is_active: true,
        created_by: '1',
        created_at: '2026-09-22T15:00:00.000Z',
      };

      const dto = toProductImageDTO(dbRow);
      expect(dto).toBeDefined();
      expect(dto.id).toBe(20);
      expect(dto.company_id).toBe(1);
      expect(dto.company).toEqual({
        id: 1,
        name: 'Pooja Fashion Retail Ltd',
        code: 'PF-CORP',
      });
      expect(dto.product_id).toBe(5);
      expect(dto.product.name).toBe('Silk Anarkali Suit');
      expect(dto.variant_id).toBe(2);
      expect(dto.variant).toEqual({
        id: 2,
        sku: 'SILK-ANK-M-RED',
        name: 'Silk Anarkali - M / Red',
      });
      expect(dto.image_url).toBe('/uploads/products/product-5/prod-5-var-2-img-123.jpg');
      expect(dto.file_size).toBe(350000);
      expect(dto.display_order).toBe(0);
      expect(dto.is_primary).toBe(true);
      expect(dto.is_active).toBe(true);
    });

    it('should handle product-level image without variant gracefully', () => {
      const dbRow = {
        id: '21',
        company_id: '1',
        product_id: '5',
        variant_id: null,
        image_url: '/uploads/products/product-5/prod-5-img-456.jpg',
        display_order: 1,
        is_primary: false,
        is_active: true,
      };

      const dto = toProductImageDTO(dbRow);
      expect(dto.id).toBe(21);
      expect(dto.variant_id).toBeNull();
      expect(dto.variant).toBeNull();
      expect(dto.is_primary).toBe(false);
    });

    it('should return null when input row is null or undefined', () => {
      expect(toProductImageDTO(null)).toBeNull();
      expect(toProductImageDTO(undefined)).toBeNull();
    });

    it('should map array of image rows', () => {
      const rows = [
        { id: 1, company_id: 1, product_id: 1, image_url: '/img1.jpg' },
        { id: 2, company_id: 1, product_id: 1, image_url: '/img2.jpg' },
      ];
      const list = toProductImageListDTO(rows);
      expect(list.length).toBe(2);
      expect(list[0].id).toBe(1);
      expect(list[1].id).toBe(2);
    });

    it('should return empty array for non-array input', () => {
      expect(toProductImageListDTO(null)).toEqual([]);
      expect(toProductImageListDTO([])).toEqual([]);
    });
  });

  describe('Validation Schemas', () => {
    describe('createProductImageSchema', () => {
      it('should validate valid image creation payload', () => {
        const payload = {
          company_id: '1',
          product_id: '10',
          variant_id: '2',
          image_url: '/uploads/products/product-10/img.jpg',
          alt_text: 'Front view',
          display_order: '1',
          is_primary: 'true',
          is_active: 1,
        };

        const result = createProductImageSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.company_id).toBe(1);
        expect(result.data.product_id).toBe(10);
        expect(result.data.variant_id).toBe(2);
        expect(result.data.display_order).toBe(1);
        expect(result.data.is_primary).toBe(true);
        expect(result.data.is_active).toBe(true);
      });

      it('should allow optional variant_id and defaults', () => {
        const payload = {
          company_id: 1,
          product_id: 10,
        };

        const result = createProductImageSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.variant_id).toBeNull();
        expect(result.data.display_order).toBe(0);
        expect(result.data.is_primary).toBe(false);
        expect(result.data.is_active).toBe(true);
      });

      it('should reject missing company_id or product_id', () => {
        expect(createProductImageSchema.safeParse({}).success).toBe(false);
        expect(createProductImageSchema.safeParse({ company_id: 1 }).success).toBe(false);
      });

      it('should reject negative display_order', () => {
        const payload = {
          company_id: 1,
          product_id: 10,
          display_order: -1,
        };
        expect(createProductImageSchema.safeParse(payload).success).toBe(false);
      });
    });

    describe('updateProductImageSchema', () => {
      it('should validate partial update payload', () => {
        const payload = {
          alt_text: 'Updated Alt Text',
          display_order: 3,
          is_primary: true,
        };
        const result = updateProductImageSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.alt_text).toBe('Updated Alt Text');
        expect(result.data.display_order).toBe(3);
        expect(result.data.is_primary).toBe(true);
      });
    });

    describe('reorderImagesSchema', () => {
      it('should validate array of reorder items', () => {
        const payload = {
          items: [
            { id: 1, display_order: 0 },
            { id: 2, display_order: 1 },
          ],
        };
        const result = reorderImagesSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.items.length).toBe(2);
      });

      it('should reject empty reorder items array', () => {
        expect(reorderImagesSchema.safeParse({ items: [] }).success).toBe(false);
      });
    });

    describe('updateStatusSchema & setPrimaryImageSchema', () => {
      it('should validate status boolean', () => {
        expect(updateStatusSchema.safeParse({ is_active: 'false' }).data.is_active).toBe(false);
        expect(updateStatusSchema.safeParse({ is_active: 1 }).data.is_active).toBe(true);
        expect(updateStatusSchema.safeParse({}).success).toBe(false);
      });

      it('should validate setPrimaryImageSchema default true', () => {
        expect(setPrimaryImageSchema.safeParse({}).data.is_primary).toBe(true);
      });
    });

    describe('Param and Query Schemas', () => {
      it('should validate imageIdParamSchema and productIdParamSchema', () => {
        expect(imageIdParamSchema.safeParse({ id: '25' }).data.id).toBe(25);
        expect(productIdParamSchema.safeParse({ productId: '50' }).data.productId).toBe(50);
      });

      it('should validate getProductImagesQuerySchema defaults', () => {
        const query = getProductImagesQuerySchema.parse({});
        expect(query.page).toBe(1);
        expect(query.limit).toBe(10);
        expect(query.sortBy).toBe('id');
        expect(query.sortOrder).toBe('asc');
      });

      it('should reject invalid sortBy in getProductImagesQuerySchema', () => {
        expect(getProductImagesQuerySchema.safeParse({ sortBy: 'invalid_sort' }).success).toBe(false);
      });
    });
  });
});
