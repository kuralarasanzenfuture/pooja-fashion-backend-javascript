export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Pooja Fashion Backend API',
    version: '1.0.0',
    description:
      'Enterprise API documentation for Pooja Fashion Retail ERP & POS system. Test and execute endpoints directly from this interactive dashboard.',
    contact: {
      name: 'Pooja Fashion Engineering Team',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Server',
    },
  ],
  tags: [
    {
      name: 'Companies',
      description: 'Corporate and business entity operations',
    },
    {
      name: 'System',
      description: 'System health and diagnostics',
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'API Health Check',
        responses: {
          200: {
            description: 'API is running normally',
          },
        },
      },
    },
    '/companies': {
      get: {
        tags: ['Companies'],
        summary: 'Get paginated list of companies',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number (starts at 1)',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items per page (max 100)',
            schema: { type: 'integer', default: 10 },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Filter by company name, code, or email',
            schema: { type: 'string' },
          },
          {
            name: 'status',
            in: 'query',
            description: 'Filter by status',
            schema: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'company_code', 'company_name', 'created_at', 'status'],
              default: 'created_at',
            },
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        ],
        responses: {
          200: {
            description: 'List of companies retrieved successfully',
          },
        },
      },
      post: {
        tags: ['Companies'],
        summary: 'Create a new company',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_code', 'company_name'],
                properties: {
                  company_code: { type: 'string', example: 'PFS001' },
                  company_name: { type: 'string', example: 'Pooja Fashion Shop' },
                  legal_name: { type: 'string', example: 'Pooja Fashion Shop Private Limited' },
                  display_name: { type: 'string', example: 'Pooja Fashion' },
                  business_type: { type: 'string', example: 'Retail' },
                  industry_type: { type: 'string', example: 'Fashion & Garments' },
                  registration_number: { type: 'string', example: 'U18109TN2024PTC123456' },
                  email: { type: 'string', example: 'contact@poojafashion.com' },
                  phone: { type: 'string', example: '04344-245678' },
                  mobile: { type: 'string', example: '+919876543210' },
                  website: { type: 'string', example: 'https://www.poojafashion.com' },
                  logo_url: { type: 'string', example: 'https://www.poojafashion.com/logo.png' },
                  default_currency: { type: 'string', example: 'INR', default: 'INR' },
                  country_code: { type: 'string', example: 'IN', default: 'IN' },
                  timezone: { type: 'string', example: 'Asia/Kolkata', default: 'Asia/Kolkata' },
                  financial_year_start_month: { type: 'integer', example: 4, default: 4 },
                  status: {
                    type: 'string',
                    enum: ['active', 'inactive', 'suspended'],
                    default: 'active',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Company created successfully' },
          400: { description: 'Validation error or duplicate company code' },
        },
      },
    },
    '/companies/{id}': {
      get: {
        tags: ['Companies'],
        summary: 'Get company by primary ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
      put: {
        tags: ['Companies'],
        summary: 'Update company details',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  company_name: { type: 'string', example: 'Pooja Fashion Retail Ltd' },
                  display_name: { type: 'string', example: 'Pooja Fashion Main Store' },
                  email: { type: 'string', example: 'info@poojafashion.com' },
                  phone: { type: 'string', example: '04344-245999' },
                  mobile: { type: 'string', example: '+919876500000' },
                  status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Company updated successfully' },
          404: { description: 'Company not found' },
        },
      },
      delete: {
        tags: ['Companies'],
        summary: 'Delete company by primary ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company deleted successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/companies/code/{companyCode}': {
      get: {
        tags: ['Companies'],
        summary: 'Get company by unique company code',
        parameters: [
          {
            name: 'companyCode',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'PFS001' },
          },
        ],
        responses: {
          200: { description: 'Company retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/companies/{id}/status': {
      patch: {
        tags: ['Companies'],
        summary: 'Update company status',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['active', 'inactive', 'suspended'],
                    example: 'inactive',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Company status updated successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
  },
};

export default swaggerSpec;
