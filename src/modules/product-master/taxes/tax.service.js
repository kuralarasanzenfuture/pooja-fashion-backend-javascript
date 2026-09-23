import * as taxRepo from './tax.repository.js';
import * as companyRepo from '../../companies/company.repository.js';
import { toTaxDTO, toTaxesDTO } from './tax.mapper.js';
import { STANDARD_GST_SLABS } from './tax.types.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';

/**
 * Normalizes and computes component tax rates for GST
 */
const resolveGstComponentRates = (rate, cgstRate, sgstRate, igstRate, taxType = 'GST') => {
  if (taxType.toUpperCase() !== 'GST') {
    return {
      cgst_rate: cgstRate !== undefined ? cgstRate : 0,
      sgst_rate: sgstRate !== undefined ? sgstRate : 0,
      igst_rate: igstRate !== undefined ? igstRate : 0,
    };
  }

  const finalCgst = cgstRate !== undefined ? cgstRate : Number((rate / 2).toFixed(4));
  const finalSgst = sgstRate !== undefined ? sgstRate : Number((rate / 2).toFixed(4));
  const finalIgst = igstRate !== undefined ? igstRate : rate;

  return {
    cgst_rate: finalCgst,
    sgst_rate: finalSgst,
    igst_rate: finalIgst,
  };
};

/**
 * Creates a new tax record
 */
export const createTax = async (data, userId = null) => {
  // Check if company exists
  const company = await companyRepo.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  // Check code uniqueness
  const existingCode = await taxRepo.findTaxByCode(data.company_id, data.tax_code);
  if (existingCode) {
    throw new BadRequestError(`Tax with code '${data.tax_code}' already exists for this company`);
  }

  // Check name uniqueness
  const existingName = await taxRepo.findTaxByName(data.company_id, data.tax_name);
  if (existingName) {
    throw new BadRequestError(`Tax with name '${data.tax_name}' already exists for this company`);
  }

  const { cgst_rate, sgst_rate, igst_rate } = resolveGstComponentRates(
    data.rate,
    data.cgst_rate,
    data.sgst_rate,
    data.igst_rate,
    data.tax_type
  );

  const created = await taxRepo.createTax({
    ...data,
    cgst_rate,
    sgst_rate,
    igst_rate,
    created_by: userId,
  });

  return toTaxDTO(created);
};

/**
 * Gets taxes with filters and pagination
 */
export const getTaxes = async (filters) => {
  const result = await taxRepo.findTaxes(filters);
  return {
    taxes: toTaxesDTO(result.taxes),
    pagination: result.pagination,
  };
};

/**
 * Gets a single tax by ID
 */
export const getTaxById = async (id) => {
  const tax = await taxRepo.findTaxById(id);
  if (!tax) {
    throw new NotFoundError('Tax not found');
  }
  return toTaxDTO(tax);
};

/**
 * Updates an existing tax record
 */
export const updateTax = async (id, data, userId = null) => {
  const existing = await taxRepo.findTaxById(id);
  if (!existing) {
    throw new NotFoundError('Tax not found');
  }

  if (data.tax_code) {
    const duplicateCode = await taxRepo.findTaxByCode(existing.company_id, data.tax_code, id);
    if (duplicateCode) {
      throw new BadRequestError(`Tax with code '${data.tax_code}' already exists for this company`);
    }
  }

  if (data.tax_name) {
    const duplicateName = await taxRepo.findTaxByName(existing.company_id, data.tax_name, id);
    if (duplicateName) {
      throw new BadRequestError(`Tax with name '${data.tax_name}' already exists for this company`);
    }
  }

  let componentRates = {};
  const rateToUse = data.rate !== undefined ? data.rate : existing.rate;
  const typeToUse = data.tax_type || existing.tax_type;

  if (data.rate !== undefined || data.cgst_rate !== undefined || data.sgst_rate !== undefined) {
    componentRates = resolveGstComponentRates(
      rateToUse,
      data.cgst_rate,
      data.sgst_rate,
      data.igst_rate,
      typeToUse
    );
  }

  const updated = await taxRepo.updateTax(id, {
    ...data,
    ...componentRates,
    updated_by: userId,
  });

  return toTaxDTO(updated);
};

/**
 * Toggles active status of a tax
 */
export const updateTaxStatus = async (id, isActive, userId = null) => {
  const existing = await taxRepo.findTaxById(id);
  if (!existing) {
    throw new NotFoundError('Tax not found');
  }

  const updated = await taxRepo.updateTax(id, {
    is_active: isActive,
    updated_by: userId,
  });

  return toTaxDTO(updated);
};

/**
 * Deletes a tax record if not in use
 */
export const deleteTax = async (id) => {
  const existing = await taxRepo.findTaxById(id);
  if (!existing) {
    throw new NotFoundError('Tax not found');
  }

  const inUse = await taxRepo.isTaxInUse(id);
  if (inUse) {
    throw new BadRequestError('Cannot delete tax as it is currently associated with products');
  }

  await taxRepo.deleteTax(id);
  return true;
};

/**
 * Seeds standard Indian GST slabs (0%, 5%, 12%, 18%, 28%) for a company
 */
export const seedDefaultTaxes = async (companyId, userId = null) => {
  const company = await companyRepo.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const seeded = [];
  for (const slab of STANDARD_GST_SLABS) {
    const existing = await taxRepo.findTaxByCode(companyId, slab.tax_code);
    if (!existing) {
      const created = await taxRepo.createTax({
        ...slab,
        company_id: companyId,
        created_by: userId,
      });
      seeded.push(toTaxDTO(created));
    }
  }

  return {
    seeded_count: seeded.length,
    taxes: seeded,
  };
};

/**
 * Calculates tax breakdown for an amount (inclusive/exclusive, intra/inter-state)
 */
export const calculateTaxBreakdown = async (params) => {
  const { amount, tax_id, is_inter_state = false } = params;

  let rate = params.rate;
  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;
  let cessRate = 0;
  let isInclusive = params.is_inclusive !== undefined ? params.is_inclusive : false;

  if (tax_id) {
    const tax = await taxRepo.findTaxById(tax_id);
    if (!tax) {
      throw new NotFoundError(`Tax with ID ${tax_id} not found`);
    }
    rate = Number(tax.rate);
    cgstRate = Number(tax.cgst_rate);
    sgstRate = Number(tax.sgst_rate);
    igstRate = Number(tax.igst_rate);
    cessRate = Number(tax.cess_rate);
    if (params.is_inclusive === undefined) {
      isInclusive = Boolean(tax.is_inclusive);
    }
  } else {
    rate = Number(rate);
    const comps = resolveGstComponentRates(rate, undefined, undefined, undefined, 'GST');
    cgstRate = comps.cgst_rate;
    sgstRate = comps.sgst_rate;
    igstRate = comps.igst_rate;
  }

  const totalEffectiveRate = rate + cessRate;
  let taxableAmount;
  let taxAmount;
  let totalAmount;

  if (isInclusive) {
    // Amount already includes tax: Base = Amount / (1 + Rate / 100)
    taxableAmount = Number((amount / (1 + totalEffectiveRate / 100)).toFixed(2));
    taxAmount = Number((amount - taxableAmount).toFixed(2));
    totalAmount = Number(amount.toFixed(2));
  } else {
    // Amount is pre-tax: Tax = Amount * (Rate / 100)
    taxableAmount = Number(amount.toFixed(2));
    taxAmount = Number(((taxableAmount * totalEffectiveRate) / 100).toFixed(2));
    totalAmount = Number((taxableAmount + taxAmount).toFixed(2));
  }

  // Component breakdowns
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let cessAmount = 0;

  if (cessRate > 0) {
    cessAmount = Number(((taxableAmount * cessRate) / 100).toFixed(2));
  }

  if (is_inter_state) {
    igstAmount = Number(((taxableAmount * igstRate) / 100).toFixed(2));
  } else {
    cgstAmount = Number(((taxableAmount * cgstRate) / 100).toFixed(2));
    sgstAmount = Number(((taxableAmount * sgstRate) / 100).toFixed(2));
  }

  return {
    original_amount: Number(amount.toFixed(2)),
    taxable_amount: taxableAmount,
    tax_rate: rate,
    tax_amount: taxAmount,
    cgst_rate: is_inter_state ? 0 : cgstRate,
    cgst_amount: cgstAmount,
    sgst_rate: is_inter_state ? 0 : sgstRate,
    sgst_amount: sgstAmount,
    igst_rate: is_inter_state ? igstRate : 0,
    igst_amount: igstAmount,
    cess_rate: cessRate,
    cess_amount: cessAmount,
    total_amount: totalAmount,
    is_inclusive: isInclusive,
    is_inter_state: Boolean(is_inter_state),
  };
};
