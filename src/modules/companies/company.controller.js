import companyService from './company.service.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';

export class CompanyController {
  constructor(service = companyService) {
    this.service = service;
  }

  /**
   * GET /api/companies
   */
  getAll = async (req, res, next) => {
    try {
      const { companies, meta } = await this.service.getCompanies(req.query);
      return sendSuccess(res, companies, 'Companies retrieved successfully', 200, meta);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * GET /api/companies/:id
   */
  getById = async (req, res, next) => {
    try {
      const company = await this.service.getCompanyById(req.params.id);
      return sendSuccess(res, company, 'Company retrieved successfully');
    } catch (error) {
      return next(error);
    }
  };

  /**
   * GET /api/companies/code/:companyCode
   */
  getByCode = async (req, res, next) => {
    try {
      const company = await this.service.getCompanyByCode(req.params.companyCode);
      return sendSuccess(res, company, 'Company retrieved successfully');
    } catch (error) {
      return next(error);
    }
  };

  /**
   * POST /api/companies
   */
  create = async (req, res, next) => {
    try {
      const company = await this.service.createCompany(req.body);
      return sendCreated(res, company, 'Company created successfully');
    } catch (error) {
      return next(error);
    }
  };

  /**
   * PUT /api/companies/:id
   */
  update = async (req, res, next) => {
    try {
      const company = await this.service.updateCompany(req.params.id, req.body);
      return sendSuccess(res, company, 'Company updated successfully');
    } catch (error) {
      return next(error);
    }
  };

  /**
   * PATCH /api/companies/:id/status
   */
  updateStatus = async (req, res, next) => {
    try {
      const company = await this.service.updateCompanyStatus(req.params.id, req.body.status);
      return sendSuccess(res, company, 'Company status updated successfully');
    } catch (error) {
      return next(error);
    }
  };

  /**
   * DELETE /api/companies/:id
   */
  deleteCompany = async (req, res, next) => {
    try {
      const deleted = await this.service.deleteCompany(req.params.id);
      return sendSuccess(res, deleted, 'Company deleted successfully');
    } catch (error) {
      return next(error);
    }
  };
}

export const companyController = new CompanyController();
export default companyController;
