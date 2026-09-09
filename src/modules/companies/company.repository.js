import { getDatabasePool } from '../../database/connection.js';

export class CompanyRepository {
  get pool() {
    const p = getDatabasePool();
    if (!p) {
      throw new Error('Database pool has not been initialized');
    }
    return p;
  }

  /**
   * Find paginated list of companies with optional filters
   */
  async findAll({
    limit = 10,
    offset = 0,
    search,
    status,
    sortBy = 'created_at',
    sortOrder = 'DESC',
  } = {}) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (search) {
      conditions.push(
        `(company_name ILIKE $${paramIndex} OR company_code ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Whitelist sort columns to prevent SQL injection
    const allowedSortColumns = {
      id: 'id',
      company_code: 'company_code',
      company_name: 'company_name',
      created_at: 'created_at',
      status: 'status',
    };
    const orderColumn = allowedSortColumns[sortBy] || 'created_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) AS total FROM companies ${whereClause}`;
    const dataQuery = `
      SELECT * FROM companies 
      ${whereClause} 
      ORDER BY ${orderColumn} ${direction} 
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const [countResult, dataResult] = await Promise.all([
      this.pool.query(countQuery, values),
      this.pool.query(dataQuery, [...values, limit, offset]),
    ]);

    const total = parseInt(countResult.rows[0]?.total || 0, 10);
    return { rows: dataResult.rows, total };
  }

  /**
   * Find company by ID
   */
  async findById(id) {
    const query = 'SELECT * FROM companies WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find company by unique company_code
   */
  async findByCode(companyCode) {
    const query = 'SELECT * FROM companies WHERE UPPER(company_code) = UPPER($1)';
    const result = await this.pool.query(query, [companyCode]);
    return result.rows[0] || null;
  }

  /**
   * Check if company_code exists (optionally excluding a company id for updates)
   */
  async existsByCode(companyCode, excludeId = null) {
    let query = 'SELECT id FROM companies WHERE UPPER(company_code) = UPPER($1)';
    const params = [companyCode];

    if (excludeId) {
      query += ' AND id != $2';
      params.push(excludeId);
    }

    const result = await this.pool.query(query, params);
    return result.rowCount > 0;
  }

  /**
   * Insert new company record
   */
  async create(data) {
    const columns = [
      'company_code',
      'company_name',
      'legal_name',
      'display_name',
      'business_type',
      'industry_type',
      'registration_number',
      'email',
      'phone',
      'mobile',
      'website',
      'logo_url',
      'default_currency',
      'country_code',
      'timezone',
      'financial_year_start_month',
      'status',
    ];

    const values = [
      data.company_code,
      data.company_name,
      data.legal_name || null,
      data.display_name || null,
      data.business_type || null,
      data.industry_type || null,
      data.registration_number || null,
      data.email || null,
      data.phone || null,
      data.mobile || null,
      data.website || null,
      data.logo_url || null,
      data.default_currency || 'INR',
      data.country_code || 'IN',
      data.timezone || 'Asia/Kolkata',
      data.financial_year_start_month || 4,
      data.status || 'active',
    ];

    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const query = `
      INSERT INTO companies (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Update existing company by ID
   */
  async update(id, data) {
    const allowedFields = [
      'company_code',
      'company_name',
      'legal_name',
      'display_name',
      'business_type',
      'industry_type',
      'registration_number',
      'email',
      'phone',
      'mobile',
      'website',
      'logo_url',
      'default_currency',
      'country_code',
      'timezone',
      'financial_year_start_month',
      'status',
    ];

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        setClauses.push(`${field} = $${paramIndex++}`);
        values.push(data[field]);
      }
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE companies
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Update status of company
   */
  async updateStatus(id, status) {
    const query = `
      UPDATE companies
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await this.pool.query(query, [status, id]);
    return result.rows[0] || null;
  }

  /**
   * Delete company by ID
   */
  async delete(id) {
    const query = 'DELETE FROM companies WHERE id = $1 RETURNING *';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

export const companyRepository = new CompanyRepository();
export default companyRepository;
