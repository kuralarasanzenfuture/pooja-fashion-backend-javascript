import companyRepository from './company.repository.js';
import { toCompanyDTO, toCompanyListDTO } from './company.mapper.js';
import NotFoundError from '../../shared/errors/NotFoundError.js';
import BadRequestError from '../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../shared/utils/pagination.js';

export class CompanyService {
  constructor(repository = companyRepository) {
    this.repository = repository;
  }

  /**
   * List companies with pagination, filtering, and search
   */
  async getCompanies(query) {
    const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
    const status = query.status || null;

    const { rows, total } = await this.repository.findAll({
      limit,
      offset,
      search,
      status,
      sortBy,
      sortOrder,
    });

    const meta = formatPaginationMeta(total, page, limit);
    return {
      companies: toCompanyListDTO(rows),
      meta,
    };
  }

  /**
   * Get single company by ID
   */
  async getCompanyById(id) {
    const company = await this.repository.findById(id);
    if (!company) {
      throw new NotFoundError(`Company with ID ${id} not found`);
    }
    return toCompanyDTO(company);
  }

  /**
   * Get single company by company code
   */
  async getCompanyByCode(companyCode) {
    const company = await this.repository.findByCode(companyCode);
    if (!company) {
      throw new NotFoundError(`Company with code '${companyCode}' not found`);
    }
    return toCompanyDTO(company);
  }

  /**
   * Create new company
   */
  async createCompany(data) {
    const codeExists = await this.repository.existsByCode(data.company_code);
    if (codeExists) {
      throw new BadRequestError(`Company code '${data.company_code}' is already in use`);
    }

    const created = await this.repository.create(data);
    return toCompanyDTO(created);
  }

  /**
   * Update company details
   */
  async updateCompany(id, data) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Company with ID ${id} not found`);
    }

    if (data.company_code && data.company_code !== existing.company_code) {
      const codeExists = await this.repository.existsByCode(data.company_code, id);
      if (codeExists) {
        throw new BadRequestError(`Company code '${data.company_code}' is already in use`);
      }
    }

    const updated = await this.repository.update(id, data);
    return toCompanyDTO(updated);
  }

  /**
   * Update company active/inactive/suspended status
   */
  async updateCompanyStatus(id, status) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Company with ID ${id} not found`);
    }

    const updated = await this.repository.updateStatus(id, status);
    return toCompanyDTO(updated);
  }

  /**
   * Delete company by ID
   */
  async deleteCompany(id) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Company with ID ${id} not found`);
    }

    const deleted = await this.repository.delete(id);
    return toCompanyDTO(deleted);
  }
}

export const companyService = new CompanyService();
export default companyService;
