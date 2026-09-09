import * as bankRepository from './bank.repository.js';
import { toBankDTO, toBankListDTO } from './bank.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';
import { toSlug, deleteFileByUrl, deleteDirectory } from '../../../shared/utils/file.js';

/**
 * Extract uploaded logo URLs from req.files dictionary
 */
export const extractUploadedLogos = (files, bankSlug) => {
  const result = {};
  if (!files) return result;

  const slug = bankSlug || 'bank';

  if (files.logo && files.logo[0]) {
    result.logo_url = `/uploads/banks/${slug}/${files.logo[0].filename}`;
  } else if (files.image && files.image[0]) {
    result.logo_url = `/uploads/banks/${slug}/${files.image[0].filename}`;
  }

  if (files.logo_light && files.logo_light[0]) {
    result.logo_light_url = `/uploads/banks/${slug}/${files.logo_light[0].filename}`;
  }

  if (files.logo_dark && files.logo_dark[0]) {
    result.logo_dark_url = `/uploads/banks/${slug}/${files.logo_dark[0].filename}`;
  }

  return result;
};

/**
 * List banks with pagination, filtering, and search
 */
export const getBanks = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const bankType = query.bank_type || null;
  const countryCode = query.country_code || null;
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const isVerified = query.is_verified !== undefined ? query.is_verified : null;

  const { rows, total } = await bankRepository.findAll({
    limit,
    offset,
    search,
    bankType,
    countryCode,
    isActive,
    isVerified,
    sortBy: sortBy || 'display_order',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    banks: toBankListDTO(rows),
    meta,
  };
};

/**
 * Get single bank by ID
 */
export const getBankById = async (id) => {
  const bank = await bankRepository.findById(id);
  if (!bank) {
    throw new NotFoundError(`Bank with ID ${id} not found`);
  }
  return toBankDTO(bank);
};

/**
 * Get bank by code
 */
export const getBankByCode = async (bankCode) => {
  const bank = await bankRepository.findByCode(bankCode);
  if (!bank) {
    throw new NotFoundError(`Bank with code '${bankCode}' not found`);
  }
  return toBankDTO(bank);
};

/**
 * Create new bank with optional logo uploads
 */
export const createBank = async (data, files = null, bankUploadSlug = null) => {
  const codeExists = await bankRepository.existsByCode(data.bank_code);
  if (codeExists) {
    throw new BadRequestError(`Bank code '${data.bank_code}' is already in use`);
  }

  const slug = bankUploadSlug || toSlug(data.bank_name || data.bank_code);
  const uploadedLogos = extractUploadedLogos(files, slug);
  Object.assign(data, uploadedLogos);

  const created = await bankRepository.create(data);
  return toBankDTO(created);
};

/**
 * Update existing bank with optional logo replacements and disk cleanup
 */
export const updateBank = async (id, data, files = null, bankUploadSlug = null) => {
  const existing = await bankRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Bank with ID ${id} not found`);
  }

  if (data.bank_code && data.bank_code !== existing.bank_code) {
    const codeExists = await bankRepository.existsByCode(data.bank_code, id);
    if (codeExists) {
      throw new BadRequestError(`Bank code '${data.bank_code}' is already in use`);
    }
  }

  const slug = bankUploadSlug || toSlug(data.bank_name || existing.bank_name || existing.bank_code);
  const uploadedLogos = extractUploadedLogos(files, slug);

  // Remove old files if replacing logo_url
  const targetLogoUrl = uploadedLogos.logo_url || data.logo_url;
  if (targetLogoUrl && existing.logo_url && existing.logo_url !== targetLogoUrl) {
    await deleteFileByUrl(existing.logo_url);
  }

  // Remove old files if replacing logo_light_url
  const targetLightUrl = uploadedLogos.logo_light_url || data.logo_light_url;
  if (targetLightUrl && existing.logo_light_url && existing.logo_light_url !== targetLightUrl) {
    await deleteFileByUrl(existing.logo_light_url);
  }

  // Remove old files if replacing logo_dark_url
  const targetDarkUrl = uploadedLogos.logo_dark_url || data.logo_dark_url;
  if (targetDarkUrl && existing.logo_dark_url && existing.logo_dark_url !== targetDarkUrl) {
    await deleteFileByUrl(existing.logo_dark_url);
  }

  Object.assign(data, uploadedLogos);

  const updated = await bankRepository.update(id, data);
  return toBankDTO(updated);
};

/**
 * Update active status of a bank
 */
export const updateBankStatus = async (id, isActive) => {
  const existing = await bankRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Bank with ID ${id} not found`);
  }

  const updated = await bankRepository.updateStatus(id, isActive);
  return toBankDTO(updated);
};

/**
 * Upload dedicated logo for an existing bank
 */
export const uploadBankLogo = async (id, files, bankUploadSlug = null) => {
  const existing = await bankRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Bank with ID ${id} not found`);
  }

  const slug = bankUploadSlug || toSlug(existing.bank_name || existing.bank_code || id);
  const uploadedLogos = extractUploadedLogos(files, slug);

  if (Object.keys(uploadedLogos).length === 0) {
    throw new BadRequestError('No logo image file was uploaded');
  }

  if (uploadedLogos.logo_url && existing.logo_url && existing.logo_url !== uploadedLogos.logo_url) {
    await deleteFileByUrl(existing.logo_url);
  }

  if (
    uploadedLogos.logo_light_url &&
    existing.logo_light_url &&
    existing.logo_light_url !== uploadedLogos.logo_light_url
  ) {
    await deleteFileByUrl(existing.logo_light_url);
  }

  if (
    uploadedLogos.logo_dark_url &&
    existing.logo_dark_url &&
    existing.logo_dark_url !== uploadedLogos.logo_dark_url
  ) {
    await deleteFileByUrl(existing.logo_dark_url);
  }

  const updated = await bankRepository.update(id, uploadedLogos);
  return toBankDTO(updated);
};

/**
 * Delete bank logo files from disk and set DB URLs to null
 */
export const deleteBankLogo = async (id, type = 'all') => {
  const existing = await bankRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Bank with ID ${id} not found`);
  }

  const updates = {};

  if (type === 'logo' || type === 'all') {
    if (existing.logo_url) {
      await deleteFileByUrl(existing.logo_url);
    }
    updates.logo_url = null;
  }

  if (type === 'logo_light' || type === 'all') {
    if (existing.logo_light_url) {
      await deleteFileByUrl(existing.logo_light_url);
    }
    updates.logo_light_url = null;
  }

  if (type === 'logo_dark' || type === 'all') {
    if (existing.logo_dark_url) {
      await deleteFileByUrl(existing.logo_dark_url);
    }
    updates.logo_dark_url = null;
  }

  if (type === 'all') {
    const slug = toSlug(existing.bank_name || existing.bank_code || id);
    await deleteDirectory(`/uploads/banks/${slug}`);
  }

  const updated = await bankRepository.update(id, updates);
  return toBankDTO(updated);
};

/**
 * Delete bank by ID and cleanup all associated logo files and bank directory
 */
export const deleteBank = async (id) => {
  const existing = await bankRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Bank with ID ${id} not found`);
  }

  // Delete physical logo files
  if (existing.logo_url) {
    await deleteFileByUrl(existing.logo_url);
  }
  if (existing.logo_light_url) {
    await deleteFileByUrl(existing.logo_light_url);
  }
  if (existing.logo_dark_url) {
    await deleteFileByUrl(existing.logo_dark_url);
  }

  // Delete bank's upload folder
  const slug = toSlug(existing.bank_name || existing.bank_code || id);
  await deleteDirectory(`/uploads/banks/${slug}`);

  const deleted = await bankRepository.deleteBank(id);
  return toBankDTO(deleted);
};

export default {
  extractUploadedLogos,
  getBanks,
  getBankById,
  getBankByCode,
  createBank,
  updateBank,
  updateBankStatus,
  uploadBankLogo,
  deleteBankLogo,
  deleteBank,
};
