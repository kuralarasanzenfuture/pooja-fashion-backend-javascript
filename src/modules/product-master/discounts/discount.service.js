import * as discountRepo from './discount.repository.js';
import * as companyRepo from '../../companies/company.repository.js';
import { toDiscountDTO, toDiscountsDTO } from './discount.mapper.js';
import { STANDARD_DISCOUNT_TEMPLATES, DISCOUNT_TYPES } from './discount.types.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';

/**
 * Creates a new discount record
 */
export const createDiscount = async (data, userId = null) => {
  const company = await companyRepo.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  const existingCode = await discountRepo.findDiscountByCode(
    data.company_id,
    data.discount_code
  );
  if (existingCode) {
    throw new BadRequestError(
      `Discount with code '${data.discount_code}' already exists for this company`
    );
  }

  const created = await discountRepo.createDiscount({
    ...data,
    created_by: userId,
  });

  return toDiscountDTO(created);
};

/**
 * Gets discounts with filters and pagination
 */
export const getDiscounts = async (filters) => {
  const result = await discountRepo.findDiscounts(filters);
  return {
    discounts: toDiscountsDTO(result.discounts),
    pagination: result.pagination,
  };
};

/**
 * Gets a single discount by ID
 */
export const getDiscountById = async (id) => {
  const discount = await discountRepo.findDiscountById(id);
  if (!discount) {
    throw new NotFoundError('Discount not found');
  }
  return toDiscountDTO(discount);
};

/**
 * Updates an existing discount record
 */
export const updateDiscount = async (id, data, userId = null) => {
  const existing = await discountRepo.findDiscountById(id);
  if (!existing) {
    throw new NotFoundError('Discount not found');
  }

  if (data.discount_code) {
    const duplicate = await discountRepo.findDiscountByCode(
      existing.company_id,
      data.discount_code,
      id
    );
    if (duplicate) {
      throw new BadRequestError(
        `Discount with code '${data.discount_code}' already exists for this company`
      );
    }
  }

  const effectiveType = data.discount_type || existing.discount_type;
  const effectiveValue =
    data.discount_value !== undefined ? data.discount_value : Number(existing.discount_value);
  if (effectiveType === DISCOUNT_TYPES.PERCENTAGE && effectiveValue > 100) {
    throw new BadRequestError('Percentage discount cannot exceed 100%');
  }

  const effectiveStart = data.start_at !== undefined ? data.start_at : existing.start_at;
  const effectiveEnd = data.end_at !== undefined ? data.end_at : existing.end_at;
  if (
    effectiveStart &&
    effectiveEnd &&
    new Date(effectiveEnd).getTime() <= new Date(effectiveStart).getTime()
  ) {
    throw new BadRequestError('end_at must be after start_at');
  }

  const updated = await discountRepo.updateDiscount(id, {
    ...data,
    updated_by: userId,
  });

  return toDiscountDTO(updated);
};

/**
 * Toggles active status of a discount
 */
export const updateDiscountStatus = async (id, isActive, userId = null) => {
  const existing = await discountRepo.findDiscountById(id);
  if (!existing) {
    throw new NotFoundError('Discount not found');
  }

  const updated = await discountRepo.updateDiscount(id, {
    is_active: isActive,
    updated_by: userId,
  });

  return toDiscountDTO(updated);
};

/**
 * Deletes a discount record if not in use
 */
export const deleteDiscount = async (id) => {
  const existing = await discountRepo.findDiscountById(id);
  if (!existing) {
    throw new NotFoundError('Discount not found');
  }

  const inUse = await discountRepo.isDiscountInUse(id);
  if (inUse) {
    throw new BadRequestError(
      'Cannot delete discount as it is currently associated with products'
    );
  }

  await discountRepo.deleteDiscount(id);
  return true;
};

/**
 * Seeds standard retail promotional discounts for a company
 */
export const seedStandardDiscounts = async (companyId, userId = null) => {
  const company = await companyRepo.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const seeded = [];
  for (const template of STANDARD_DISCOUNT_TEMPLATES) {
    const existing = await discountRepo.findDiscountByCode(
      companyId,
      template.discount_code
    );
    if (!existing) {
      const created = await discountRepo.createDiscount({
        ...template,
        company_id: companyId,
        created_by: userId,
      });
      seeded.push(toDiscountDTO(created));
    }
  }

  return {
    seeded_count: seeded.length,
    discounts: seeded,
  };
};

/**
 * Calculates discount deduction, capping, and savings percentage
 */
export const calculateDiscount = async (params) => {
  const { amount, quantity = 1 } = params;

  let discountType = params.discount_type;
  let discountValue = params.discount_value;
  let minimumQuantity =
    params.minimum_quantity !== undefined && params.minimum_quantity !== null
      ? Number(params.minimum_quantity)
      : null;
  let maximumDiscount =
    params.maximum_discount !== undefined && params.maximum_discount !== null
      ? Number(params.maximum_discount)
      : null;
  const now = params.as_of ? new Date(params.as_of).getTime() : Date.now();

  if (params.discount_id) {
    const discount = await discountRepo.findDiscountById(params.discount_id);
    if (!discount) {
      throw new NotFoundError(`Discount with ID ${params.discount_id} not found`);
    }

    if (!discount.is_active) {
      return {
        original_amount: Number(amount.toFixed(2)),
        quantity,
        discount_type: discount.discount_type,
        discount_value: Number(discount.discount_value),
        raw_discount: 0,
        applied_discount: 0,
        maximum_discount_cap:
          discount.maximum_discount !== null && discount.maximum_discount !== undefined
            ? Number(discount.maximum_discount)
            : null,
        final_amount: Number(amount.toFixed(2)),
        savings_percentage: 0,
        is_applicable: false,
        reason_inapplicable: 'Discount is inactive',
      };
    }

    if (discount.start_at && new Date(discount.start_at).getTime() > now) {
      return {
        original_amount: Number(amount.toFixed(2)),
        quantity,
        discount_type: discount.discount_type,
        discount_value: Number(discount.discount_value),
        raw_discount: 0,
        applied_discount: 0,
        maximum_discount_cap:
          discount.maximum_discount !== null && discount.maximum_discount !== undefined
            ? Number(discount.maximum_discount)
            : null,
        final_amount: Number(amount.toFixed(2)),
        savings_percentage: 0,
        is_applicable: false,
        reason_inapplicable: 'Discount campaign has not started yet',
      };
    }

    if (discount.end_at && new Date(discount.end_at).getTime() < now) {
      return {
        original_amount: Number(amount.toFixed(2)),
        quantity,
        discount_type: discount.discount_type,
        discount_value: Number(discount.discount_value),
        raw_discount: 0,
        applied_discount: 0,
        maximum_discount_cap:
          discount.maximum_discount !== null && discount.maximum_discount !== undefined
            ? Number(discount.maximum_discount)
            : null,
        final_amount: Number(amount.toFixed(2)),
        savings_percentage: 0,
        is_applicable: false,
        reason_inapplicable: 'Discount campaign has expired',
      };
    }

    discountType = discount.discount_type;
    discountValue = Number(discount.discount_value);
    minimumQuantity =
      discount.minimum_quantity !== null && discount.minimum_quantity !== undefined
        ? Number(discount.minimum_quantity)
        : null;
    maximumDiscount =
      discount.maximum_discount !== null && discount.maximum_discount !== undefined
        ? Number(discount.maximum_discount)
        : null;
  }

  // Validate minimum quantity threshold
  if (minimumQuantity !== null && quantity < minimumQuantity) {
    return {
      original_amount: Number(amount.toFixed(2)),
      quantity,
      discount_type: discountType,
      discount_value: Number(discountValue),
      raw_discount: 0,
      applied_discount: 0,
      maximum_discount_cap: maximumDiscount,
      final_amount: Number(amount.toFixed(2)),
      savings_percentage: 0,
      is_applicable: false,
      reason_inapplicable: `Minimum quantity of ${minimumQuantity} required (provided: ${quantity})`,
    };
  }

  // Calculate raw discount
  let rawDiscount = 0;
  if (discountType === DISCOUNT_TYPES.PERCENTAGE) {
    rawDiscount = Number(((amount * discountValue) / 100).toFixed(2));
  } else {
    rawDiscount = Number(Number(discountValue).toFixed(2));
  }

  // Apply maximum cap for percentage discounts if defined
  let appliedDiscount = rawDiscount;
  if (
    discountType === DISCOUNT_TYPES.PERCENTAGE &&
    maximumDiscount !== null &&
    appliedDiscount > maximumDiscount
  ) {
    appliedDiscount = Number(maximumDiscount.toFixed(2));
  }

  // Prevent discount from exceeding original amount
  appliedDiscount = Math.min(appliedDiscount, amount);

  const finalAmount = Number((amount - appliedDiscount).toFixed(2));
  const savingsPercentage = Number(((appliedDiscount / amount) * 100).toFixed(2));

  return {
    original_amount: Number(amount.toFixed(2)),
    quantity,
    discount_type: discountType,
    discount_value: Number(discountValue),
    raw_discount: rawDiscount,
    applied_discount: appliedDiscount,
    maximum_discount_cap:
      maximumDiscount !== null && maximumDiscount !== undefined ? Number(maximumDiscount) : null,
    final_amount: finalAmount,
    savings_percentage: savingsPercentage,
    is_applicable: true,
  };
};
