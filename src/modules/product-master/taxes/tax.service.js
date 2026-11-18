import * as taxRepo from './tax.repository.js';
import * as companyRepo from '../../companies/company.repository.js';
import { toTaxDTO, toTaxesDTO } from './tax.mapper.js';
import { STANDARD_GST_SLABS } from './tax.types.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import ForbiddenError from '../../../shared/errors/ForbiddenError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';
import { recordAuditLog } from '../../auditLogs/auditLog.service.js';
import {
  generateTaxCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
} from './utils/index.js';

export {
  generateTaxCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
};

/**
 * Standard default Indian GST slabs (0%, 5%, 12%, 18%, 28%)
 */
export const DEFAULT_TAXES = [
  {
    tax_code: 'GST_0',
    tax_name: 'GST 0%',
    tax_type: 'GST',
    rate: 0,
    cgst_rate: 0,
    sgst_rate: 0,
    igst_rate: 0,
    cess_rate: 0,
    is_inclusive: false,
    is_active: true,
  },
  {
    tax_code: 'GST_5',
    tax_name: 'GST 5%',
    tax_type: 'GST',
    rate: 5.0,
    cgst_rate: 2.5,
    sgst_rate: 2.5,
    igst_rate: 5.0,
    cess_rate: 0,
    is_inclusive: false,
    is_active: true,
  },
  {
    tax_code: 'GST_12',
    tax_name: 'GST 12%',
    tax_type: 'GST',
    rate: 12.0,
    cgst_rate: 6.0,
    sgst_rate: 6.0,
    igst_rate: 12.0,
    cess_rate: 0,
    is_inclusive: false,
    is_active: true,
  },
  {
    tax_code: 'GST_18',
    tax_name: 'GST 18%',
    tax_type: 'GST',
    rate: 18.0,
    cgst_rate: 9.0,
    sgst_rate: 9.0,
    igst_rate: 18.0,
    cess_rate: 0,
    is_inclusive: false,
    is_active: true,
  },
  {
    tax_code: 'GST_28',
    tax_name: 'GST 28%',
    tax_type: 'GST',
    rate: 28.0,
    cgst_rate: 14.0,
    sgst_rate: 14.0,
    igst_rate: 28.0,
    cess_rate: 0,
    is_inclusive: false,
    is_active: true,
  },
];

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
export const createTax = async (data, user = null, requestContext = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, data.company_id || data.companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to create a tax');
  }

  // Check if company exists
  const company = await companyRepo.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  data.company_id = effectiveCompanyId;

  if (!data.tax_code || !String(data.tax_code).trim()) {
    data.tax_code = generateTaxCode(data.tax_name, data.rate);
  } else {
    data.tax_code = String(data.tax_code).trim().toUpperCase();
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

  const userId = user?.id || data.created_by || null;

  const created = await taxRepo.createTax({
    ...data,
    cgst_rate,
    sgst_rate,
    igst_rate,
    created_by: userId,
  });

  const dto = toTaxDTO(created);

  await recordAuditLog({
    action: 'CREATE',
    module: 'taxes',
    entityType: 'Tax',
    entityId: created.id,
    entityName: created.tax_name,
    companyId: created.company_id,
    userId,
    description: `Tax "${created.tax_name}" (Code: ${created.tax_code}, Rate: ${created.rate}%) created`,
    oldData: null,
    newData: created,
    requestContext,
  });

  return dto;
};

/**
 * Gets taxes with filters, pagination, and multi-tenant isolation
 */
export const getTaxes = async (query = {}, user = null) => {
  const { page, limit, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);

  const filters = {
    ...query,
    page,
    limit,
    sort_by: sortBy || query.sort_by,
    sort_order: sortOrder || query.sort_order,
    search: search || query.search,
    company_id: companyId,
  };

  const result = await taxRepo.findTaxes(filters);
  const meta = formatPaginationMeta(result.pagination.total, page, limit);

  return {
    taxes: toTaxesDTO(result.taxes),
    pagination: result.pagination,
    meta,
  };
};

/**
 * Gets all taxes without pagination (for dropdowns / selectors)
 */
export const getAllTaxes = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const taxType = query.tax_type ? String(query.tax_type).trim().toUpperCase() : null;
  const search = query.search ? String(query.search).trim() : null;
  const sortBy = query.sort_by || query.sortBy || 'rate';
  const sortOrder = query.sort_order || query.sortOrder || 'asc';

  const rows = await taxRepo.findAllUnpaginated({
    companyId,
    isActive,
    taxType,
    search,
    sortBy,
    sortOrder,
  });

  return toTaxesDTO(rows);
};

/**
 * Alias for getAllTaxes
 */
export const getAllUnpaginated = getAllTaxes;

/**
 * Gets tax aggregate statistics for a company
 */
export const getTaxStats = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  return taxRepo.getTaxStats(companyId);
};

/**
 * Gets a single tax by ID with tenant isolation check
 */
export const getTaxById = async (id, user = null) => {
  const tax = await taxRepo.findTaxById(id);
  if (!tax) {
    throw new NotFoundError('Tax not found');
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(tax.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view taxes for another company');
    }
  }

  return toTaxDTO(tax);
};

/**
 * Gets a tax by company ID and tax code
 */
export const getTaxByCode = async (companyId, taxCode, user = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  const tax = await taxRepo.findTaxByCode(effectiveCompanyId, taxCode);
  if (!tax) {
    throw new NotFoundError(
      `Tax with code '${taxCode}' not found for company ${effectiveCompanyId}`
    );
  }
  return toTaxDTO(tax);
};

/**
 * Gets all taxes for a specific company
 */
export const getTaxesByCompanyId = async (companyId, options = {}, user = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  const company = await companyRepo.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  const rows = await taxRepo.findByCompanyId(effectiveCompanyId, options);
  return toTaxesDTO(rows);
};

/**
 * Checks whether a tax name already exists for a company
 */
export const checkTaxNameExists = async ({ name, tax_name = null, companyId = null, excludeId = null, user = null }) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to check tax name');
  }

  const rawName = name || tax_name;
  const trimmedName = String(rawName || '').trim();
  if (!trimmedName) {
    throw new BadRequestError('Tax name is required');
  }

  const exists = await taxRepo.existsByName(effectiveCompanyId, trimmedName, excludeId);
  return {
    exists,
    message: exists
      ? `Tax name '${trimmedName}' is already taken`
      : `Tax name '${trimmedName}' is available`,
    name: trimmedName,
    companyId: effectiveCompanyId,
  };
};

/**
 * Checks whether a tax code already exists for a company
 */
export const checkTaxCodeExists = async ({ code, tax_code = null, companyId = null, excludeId = null, user = null }) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to check tax code');
  }

  const rawCode = code || tax_code;
  const trimmedCode = String(rawCode || '').trim().toUpperCase();
  if (!trimmedCode) {
    throw new BadRequestError('Tax code is required');
  }

  const exists = await taxRepo.existsByCode(effectiveCompanyId, trimmedCode, excludeId);
  return {
    exists,
    message: exists
      ? `Tax code '${trimmedCode}' is already taken`
      : `Tax code '${trimmedCode}' is available`,
    code: trimmedCode,
    companyId: effectiveCompanyId,
  };
};

/**
 * Updates an existing tax record
 */
export const updateTax = async (id, data, user = null, requestContext = null) => {
  const existing = await taxRepo.findTaxById(id);
  if (!existing) {
    throw new NotFoundError('Tax not found');
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to update taxes for another company');
    }
  }

  let targetCompanyId = Number(existing.company_id);
  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    if (!canUserSelectCompany(user)) {
      throw new ForbiddenError('You cannot reassign tax to another company');
    }
    const targetCompany = await companyRepo.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
    targetCompanyId = Number(data.company_id);
  }

  if (data.tax_code) {
    const duplicateCode = await taxRepo.findTaxByCode(targetCompanyId, data.tax_code, id);
    if (duplicateCode) {
      throw new BadRequestError(`Tax with code '${data.tax_code}' already exists for this company`);
    }
  }

  if (data.tax_name) {
    const duplicateName = await taxRepo.findTaxByName(targetCompanyId, data.tax_name, id);
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

  const userId = user?.id || data.updated_by || null;

  const updated = await taxRepo.updateTax(id, {
    ...data,
    company_id: targetCompanyId,
    ...componentRates,
    updated_by: userId,
  });

  const dto = toTaxDTO(updated);

  await recordAuditLog({
    action: 'UPDATE',
    module: 'taxes',
    entityType: 'Tax',
    entityId: id,
    entityName: updated.tax_name,
    companyId: updated.company_id,
    userId,
    description: `Tax "${updated.tax_name}" (Code: ${updated.tax_code}) updated`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Toggles active status of a tax
 */
export const updateTaxStatus = async (id, isActive, user = null, requestContext = null) => {
  const existing = await taxRepo.findTaxById(id);
  if (!existing) {
    throw new NotFoundError('Tax not found');
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to update taxes for another company');
    }
  }

  const userId = user?.id || null;

  const updated = await taxRepo.updateTax(id, {
    is_active: isActive,
    updated_by: userId,
  });

  const dto = toTaxDTO(updated);

  await recordAuditLog({
    action: 'STATUS_CHANGE',
    module: 'taxes',
    entityType: 'Tax',
    entityId: id,
    entityName: updated.tax_name,
    companyId: updated.company_id,
    userId,
    description: `Tax "${updated.tax_name}" status changed to ${isActive ? 'Active' : 'Inactive'}`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Deletes a tax record if not in use
 */
export const deleteTax = async (id, user = null, requestContext = null) => {
  const existing = await taxRepo.findTaxById(id);
  if (!existing) {
    throw new NotFoundError('Tax not found');
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to delete taxes for another company');
    }
  }

  const inUse = await taxRepo.isTaxInUse(id);
  if (inUse) {
    throw new BadRequestError('Cannot delete tax as it is currently associated with products');
  }

  await taxRepo.deleteTax(id);

  await recordAuditLog({
    action: 'DELETE',
    module: 'taxes',
    entityType: 'Tax',
    entityId: id,
    entityName: existing.tax_name,
    companyId: existing.company_id,
    userId: user?.id || null,
    description: `Tax "${existing.tax_name}" (Code: ${existing.tax_code}) deleted`,
    oldData: existing,
    newData: null,
    requestContext,
  });

  return true;
};

/**
 * Seeds standard Indian GST slabs (0%, 5%, 12%, 18%, 28%) for a company
 */
export const seedDefaultTaxes = async (companyId = null, user = null, requestContext = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to seed taxes');
  }

  const company = await companyRepo.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  const userId = user?.id || null;
  const seeded = [];

  for (const slab of DEFAULT_TAXES) {
    const existing = await taxRepo.findTaxByCode(effectiveCompanyId, slab.tax_code);
    if (!existing) {
      const created = await taxRepo.createTax({
        ...slab,
        company_id: effectiveCompanyId,
        created_by: userId,
      });
      seeded.push(toTaxDTO(created));
    }
  }

  if (seeded.length > 0) {
    await recordAuditLog({
      action: 'SEED',
      module: 'taxes',
      entityType: 'Tax',
      entityId: effectiveCompanyId,
      entityName: `Default GST Slabs for Company ${effectiveCompanyId}`,
      companyId: effectiveCompanyId,
      userId,
      description: `Seeded ${seeded.length} standard GST taxes for company ${effectiveCompanyId}`,
      oldData: null,
      newData: seeded,
      requestContext,
    });
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
