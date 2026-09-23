import { generateInternalBarcode } from '../../src/modules/product-master/productBarcodes/productBarcode.service.js';
import {
  toProductBarcodeDTO,
  toProductBarcodeListDTO,
} from '../../src/modules/product-master/productBarcodes/productBarcode.mapper.js';
import {
  createProductBarcodeSchema,
  updateProductBarcodeSchema,
  updateStatusSchema,
  setPrimaryBarcodeSchema,
  barcodeIdParamSchema,
  scanBarcodeParamSchema,
  variantIdParamSchema,
  getProductBarcodesQuerySchema,
} from '../../src/modules/product-master/productBarcodes/productBarcode.validation.js';

describe('Product Master: Product Barcodes Unit Tests', () => {
  describe('generateInternalBarcode', () => {
    it('should generate numeric retail barcode with 890 GS1 prefix', () => {
      const barcode = generateInternalBarcode(1, 10);
      expect(barcode.startsWith('890')).toBe(true);
      expect(/^\d+$/.test(barcode)).toBe(true);
      expect(barcode.length).toBeGreaterThanOrEqual(12);
    });

    it('should pad company and variant IDs correctly', () => {
      const barcode = generateInternalBarcode(5, 42);
      expect(barcode).toContain('005');
      expect(barcode).toContain('00042');
    });
  });

  describe('Product Barcode Mapper', () => {
    it('should map database entity to client DTO format with nested relations', () => {
      const dbRow = {
        id: '12',
        company_id: '1',
        company_name: 'Pooja Fashion Retail Ltd',
        company_code: 'PF-CORP',
        product_id: '3',
        product_name: 'Embroidered Silk Anarkali Suit',
        product_code: 'SILK_ANARKALI_01',
        category_id: '2',
        variant_id: '8',
        variant_sku: 'SILK-ANK-M-RED',
        variant_name: 'Silk Anarkali - M / Red',
        variant_code: 'M-RED',
        weight: '0.65',
        track_stock: true,
        allow_negative_stock: false,
        size_name: 'Medium',
        size_code: 'M',
        color_name: 'Royal Red',
        color_code: 'RED_ROYAL',
        color_hex_code: '#C41E3A',
        material_name: 'Silk',
        material_code: 'SLK',
        unit_name: 'Piece',
        unit_code: 'PCS',
        unit_symbol: 'pc',
        barcode: '8901234567890',
        barcode_type: 'EAN13',
        is_primary: true,
        is_active: true,
        created_by: '1',
        created_at: '2026-09-22T14:00:00.000Z',
      };

      const dto = toProductBarcodeDTO(dbRow);
      expect(dto).toBeDefined();
      expect(dto.id).toBe(12);
      expect(dto.company_id).toBe(1);
      expect(dto.company).toEqual({
        id: 1,
        name: 'Pooja Fashion Retail Ltd',
        code: 'PF-CORP',
      });
      expect(dto.product_id).toBe(3);
      expect(dto.product.name).toBe('Embroidered Silk Anarkali Suit');
      expect(dto.variant_id).toBe(8);
      expect(dto.variant.sku).toBe('SILK-ANK-M-RED');
      expect(dto.variant.size).toEqual({ name: 'Medium', code: 'M' });
      expect(dto.variant.color).toEqual({ name: 'Royal Red', code: 'RED_ROYAL', hex_code: '#C41E3A' });
      expect(dto.variant.material).toEqual({ name: 'Silk', code: 'SLK' });
      expect(dto.variant.unit).toEqual({ name: 'Piece', code: 'PCS', symbol: 'pc' });
      expect(dto.barcode).toBe('8901234567890');
      expect(dto.barcode_type).toBe('EAN13');
      expect(dto.is_primary).toBe(true);
      expect(dto.is_active).toBe(true);
    });

    it('should return null when input row is null or undefined', () => {
      expect(toProductBarcodeDTO(null)).toBeNull();
      expect(toProductBarcodeDTO(undefined)).toBeNull();
    });

    it('should transform array of barcode rows', () => {
      const rows = [
        { id: 1, company_id: 1, product_id: 1, variant_id: 1, barcode: 'B1' },
        { id: 2, company_id: 1, product_id: 1, variant_id: 1, barcode: 'B2' },
      ];
      const list = toProductBarcodeListDTO(rows);
      expect(list.length).toBe(2);
      expect(list[0].id).toBe(1);
      expect(list[1].id).toBe(2);
    });

    it('should return empty array for non-array input', () => {
      expect(toProductBarcodeListDTO(null)).toEqual([]);
      expect(toProductBarcodeListDTO([])).toEqual([]);
    });
  });

  describe('Validation Schemas', () => {
    describe('createProductBarcodeSchema', () => {
      it('should validate and parse valid barcode creation payload', () => {
        const payload = {
          company_id: '1',
          product_id: '2',
          variant_id: '3',
          barcode: '8901234567890',
          barcode_type: 'ean13',
          is_primary: 'true',
          is_active: 1,
        };

        const result = createProductBarcodeSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.company_id).toBe(1);
        expect(result.data.product_id).toBe(2);
        expect(result.data.variant_id).toBe(3);
        expect(result.data.barcode).toBe('8901234567890');
        expect(result.data.barcode_type).toBe('EAN13');
        expect(result.data.is_primary).toBe(true);
        expect(result.data.is_active).toBe(true);
      });

      it('should allow optional barcode and default to INTERNAL type', () => {
        const payload = {
          company_id: 1,
          product_id: 2,
          variant_id: 3,
        };

        const result = createProductBarcodeSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.barcode).toBeUndefined();
        expect(result.data.barcode_type).toBe('INTERNAL');
        expect(result.data.is_primary).toBe(false);
      });

      it('should reject missing required relational IDs', () => {
        expect(createProductBarcodeSchema.safeParse({}).success).toBe(false);
        expect(createProductBarcodeSchema.safeParse({ company_id: 1 }).success).toBe(false);
        expect(createProductBarcodeSchema.safeParse({ company_id: 1, product_id: 2 }).success).toBe(false);
      });

      it('should reject invalid barcode_type', () => {
        const payload = {
          company_id: 1,
          product_id: 2,
          variant_id: 3,
          barcode_type: 'INVALID_TYPE',
        };
        const result = createProductBarcodeSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });
    });

    describe('updateProductBarcodeSchema', () => {
      it('should validate partial update payload', () => {
        const payload = {
          barcode_type: 'CODE128',
          is_primary: true,
        };
        const result = updateProductBarcodeSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.barcode_type).toBe('CODE128');
        expect(result.data.is_primary).toBe(true);
      });
    });

    describe('updateStatusSchema & setPrimaryBarcodeSchema', () => {
      it('should validate status update boolean', () => {
        expect(updateStatusSchema.safeParse({ is_active: 'false' }).data.is_active).toBe(false);
        expect(updateStatusSchema.safeParse({ is_active: 1 }).data.is_active).toBe(true);
        expect(updateStatusSchema.safeParse({}).success).toBe(false);
      });

      it('should validate setPrimaryBarcodeSchema with default true', () => {
        expect(setPrimaryBarcodeSchema.safeParse({}).data.is_primary).toBe(true);
        expect(setPrimaryBarcodeSchema.safeParse({ is_primary: false }).data.is_primary).toBe(false);
      });
    });

    describe('Param and Query Schemas', () => {
      it('should validate barcodeIdParamSchema', () => {
        expect(barcodeIdParamSchema.safeParse({ id: '10' }).data.id).toBe(10);
      });

      it('should validate scanBarcodeParamSchema', () => {
        const res = scanBarcodeParamSchema.safeParse({ companyId: '1', barcode: '890123' });
        expect(res.success).toBe(true);
        expect(res.data.companyId).toBe(1);
        expect(res.data.barcode).toBe('890123');
      });

      it('should validate variantIdParamSchema', () => {
        expect(variantIdParamSchema.safeParse({ variantId: '5' }).data.variantId).toBe(5);
      });

      it('should validate getProductBarcodesQuerySchema with defaults', () => {
        const query = getProductBarcodesQuerySchema.parse({});
        expect(query.page).toBe(1);
        expect(query.limit).toBe(10);
        expect(query.sortBy).toBe('id');
        expect(query.sortOrder).toBe('desc');
      });

      it('should reject invalid sortBy in getProductBarcodesQuerySchema', () => {
        expect(getProductBarcodesQuerySchema.safeParse({ sortBy: 'unknown_field' }).success).toBe(false);
      });
    });
  });
});
