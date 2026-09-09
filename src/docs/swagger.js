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
      name: 'Company Addresses',
      description: 'Company addresses management operations',
    },
    {
      name: 'Company Contacts',
      description: 'Company contacts management operations',
    },
    {
      name: 'Company Tax Details',
      description: 'Company tax and regulatory registration operations',
    },
    {
      name: 'Banks',
      description: 'Bank master entity operations',
    },
    {
      name: 'Bank Identifiers',
      description: 'Bank branch routing identifiers (IFSC, SWIFT, MICR)',
    },
    {
      name: 'Company Banks',
      description: 'Corporate bank accounts and treasury management operations',
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
    '/company-addresses': {
      get: {
        tags: ['Company Addresses'],
        summary: 'Get paginated list of company addresses',
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
            name: 'company_id',
            in: 'query',
            description: 'Filter by Company ID',
            schema: { type: 'integer' },
          },
          {
            name: 'address_type',
            in: 'query',
            description: 'Filter by address type',
            schema: {
              type: 'string',
              enum: ['registered', 'head_office', 'billing', 'warehouse', 'other'],
            },
          },
          {
            name: 'is_primary',
            in: 'query',
            description: 'Filter by primary address flag',
            schema: { type: 'boolean' },
          },
          {
            name: 'is_active',
            in: 'query',
            description: 'Filter by active status',
            schema: { type: 'boolean' },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Search address lines, city, state, or company name',
            schema: { type: 'string' },
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'company_id', 'address_type', 'city', 'state', 'created_at', 'is_primary', 'is_active'],
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
            description: 'List of company addresses retrieved successfully',
          },
        },
      },
      post: {
        tags: ['Company Addresses'],
        summary: 'Create a new company address',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'address_type', 'address_line_1'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  address_type: {
                    type: 'string',
                    enum: ['registered', 'head_office', 'billing', 'warehouse', 'other'],
                    example: 'registered',
                  },
                  address_line_1: { type: 'string', example: '123 Textile Market Road' },
                  address_line_2: { type: 'string', example: 'Suite 400' },
                  city: { type: 'string', example: 'Hosur' },
                  district: { type: 'string', example: 'Krishnagiri' },
                  state: { type: 'string', example: 'Tamil Nadu' },
                  postal_code: { type: 'string', example: '635109' },
                  country: { type: 'string', example: 'India', default: 'India' },
                  landmark: { type: 'string', example: 'Near Old Bus Stand' },
                  is_primary: { type: 'boolean', default: false },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Company address created successfully' },
          400: { description: 'Validation error' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/company-addresses/{id}': {
      get: {
        tags: ['Company Addresses'],
        summary: 'Get company address by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company address retrieved successfully' },
          404: { description: 'Company address not found' },
        },
      },
      put: {
        tags: ['Company Addresses'],
        summary: 'Update company address by ID',
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
                  company_id: { type: 'integer' },
                  address_type: {
                    type: 'string',
                    enum: ['registered', 'head_office', 'billing', 'warehouse', 'other'],
                  },
                  address_line_1: { type: 'string' },
                  address_line_2: { type: 'string' },
                  city: { type: 'string' },
                  district: { type: 'string' },
                  state: { type: 'string' },
                  postal_code: { type: 'string' },
                  country: { type: 'string' },
                  landmark: { type: 'string' },
                  is_primary: { type: 'boolean' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Company address updated successfully' },
          404: { description: 'Company address not found' },
        },
      },
      delete: {
        tags: ['Company Addresses'],
        summary: 'Delete company address by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company address deleted successfully' },
          404: { description: 'Company address not found' },
        },
      },
    },
    '/company-addresses/company/{companyId}': {
      get: {
        tags: ['Company Addresses'],
        summary: 'Get all addresses for a specific company',
        parameters: [
          {
            name: 'companyId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company addresses retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/company-addresses/{id}/status': {
      patch: {
        tags: ['Company Addresses'],
        summary: 'Update company address active status',
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
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: false },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Company address status updated successfully' },
          404: { description: 'Company address not found' },
        },
      },
    },
    '/company-addresses/{id}/primary': {
      patch: {
        tags: ['Company Addresses'],
        summary: 'Set company address as primary',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company address set as primary successfully' },
          404: { description: 'Company address not found' },
        },
      },
    },
    '/company-contacts': {
      get: {
        tags: ['Company Contacts'],
        summary: 'Get paginated list of company contacts',
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
            name: 'company_id',
            in: 'query',
            description: 'Filter by Company ID',
            schema: { type: 'integer' },
          },
          {
            name: 'contact_type',
            in: 'query',
            description: 'Filter by contact type',
            schema: {
              type: 'string',
              enum: ['owner', 'manager', 'accountant', 'sales', 'support', 'other'],
            },
          },
          {
            name: 'is_primary',
            in: 'query',
            description: 'Filter by primary contact flag',
            schema: { type: 'boolean' },
          },
          {
            name: 'is_active',
            in: 'query',
            description: 'Filter by active status',
            schema: { type: 'boolean' },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Search name, email, phone, mobile, designation, or company',
            schema: { type: 'string' },
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: [
                'id',
                'company_id',
                'contact_type',
                'contact_name',
                'designation',
                'email',
                'created_at',
                'is_primary',
                'is_active',
              ],
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
            description: 'List of company contacts retrieved successfully',
          },
        },
      },
      post: {
        tags: ['Company Contacts'],
        summary: 'Create a new company contact',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'contact_type', 'contact_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  contact_type: {
                    type: 'string',
                    enum: ['owner', 'manager', 'accountant', 'sales', 'support', 'other'],
                    example: 'manager',
                  },
                  contact_name: { type: 'string', example: 'Rajesh Kumar' },
                  designation: { type: 'string', example: 'General Manager' },
                  email: { type: 'string', example: 'rajesh.kumar@poojafashion.com' },
                  phone: { type: 'string', example: '04344-245678' },
                  mobile: { type: 'string', example: '+919876543210' },
                  is_primary: { type: 'boolean', default: false },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Company contact created successfully' },
          400: { description: 'Validation error' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/company-contacts/{id}': {
      get: {
        tags: ['Company Contacts'],
        summary: 'Get company contact by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company contact retrieved successfully' },
          404: { description: 'Company contact not found' },
        },
      },
      put: {
        tags: ['Company Contacts'],
        summary: 'Update company contact by ID',
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
                  company_id: { type: 'integer' },
                  contact_type: {
                    type: 'string',
                    enum: ['owner', 'manager', 'accountant', 'sales', 'support', 'other'],
                  },
                  contact_name: { type: 'string' },
                  designation: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  mobile: { type: 'string' },
                  is_primary: { type: 'boolean' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Company contact updated successfully' },
          404: { description: 'Company contact not found' },
        },
      },
      delete: {
        tags: ['Company Contacts'],
        summary: 'Delete company contact by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company contact deleted successfully' },
          404: { description: 'Company contact not found' },
        },
      },
    },
    '/company-contacts/company/{companyId}': {
      get: {
        tags: ['Company Contacts'],
        summary: 'Get all contacts for a specific company',
        parameters: [
          {
            name: 'companyId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company contacts retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/company-contacts/{id}/status': {
      patch: {
        tags: ['Company Contacts'],
        summary: 'Update company contact active status',
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
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: false },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Company contact status updated successfully' },
          404: { description: 'Company contact not found' },
        },
      },
    },
    '/company-contacts/{id}/primary': {
      patch: {
        tags: ['Company Contacts'],
        summary: 'Set company contact as primary',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company contact set as primary successfully' },
          404: { description: 'Company contact not found' },
        },
      },
    },
    '/company-tax-details': {
      get: {
        tags: ['Company Tax Details'],
        summary: 'Get paginated list of company tax details',
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
            name: 'company_id',
            in: 'query',
            description: 'Filter by Company ID',
            schema: { type: 'integer' },
          },
          {
            name: 'gst_registration_type',
            in: 'query',
            description: 'Filter by GST scheme',
            schema: {
              type: 'string',
              enum: ['regular', 'composition', 'unregistered', 'other'],
            },
          },
          {
            name: 'is_primary',
            in: 'query',
            description: 'Filter by primary flag',
            schema: { type: 'boolean' },
          },
          {
            name: 'is_active',
            in: 'query',
            description: 'Filter by active status',
            schema: { type: 'boolean' },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Search GSTIN, PAN, TAN, tax registered name, or company',
            schema: { type: 'string' },
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: [
                'id',
                'company_id',
                'gstin',
                'pan_number',
                'tan_number',
                'gst_registration_type',
                'tax_registered_name',
                'created_at',
                'is_primary',
                'is_active',
              ],
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
            description: 'List of company tax details retrieved successfully',
          },
        },
      },
      post: {
        tags: ['Company Tax Details'],
        summary: 'Create a new company tax detail record',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  gstin: { type: 'string', example: '33AABCP1234F1Z5' },
                  pan_number: { type: 'string', example: 'AABCP1234F' },
                  tan_number: { type: 'string', example: 'CHEP12345A' },
                  gst_registration_type: {
                    type: 'string',
                    enum: ['regular', 'composition', 'unregistered', 'other'],
                    example: 'regular',
                  },
                  gst_state_code: { type: 'string', example: '33' },
                  tax_registered_name: {
                    type: 'string',
                    example: 'Pooja Fashion Shop Private Limited',
                  },
                  is_primary: { type: 'boolean', default: true },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Company tax detail created successfully' },
          400: { description: 'Validation error' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/company-tax-details/{id}': {
      get: {
        tags: ['Company Tax Details'],
        summary: 'Get company tax detail by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company tax detail retrieved successfully' },
          404: { description: 'Company tax detail not found' },
        },
      },
      put: {
        tags: ['Company Tax Details'],
        summary: 'Update company tax detail by ID',
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
                  company_id: { type: 'integer' },
                  gstin: { type: 'string' },
                  pan_number: { type: 'string' },
                  tan_number: { type: 'string' },
                  gst_registration_type: {
                    type: 'string',
                    enum: ['regular', 'composition', 'unregistered', 'other'],
                  },
                  gst_state_code: { type: 'string' },
                  tax_registered_name: { type: 'string' },
                  is_primary: { type: 'boolean' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Company tax detail updated successfully' },
          404: { description: 'Company tax detail not found' },
        },
      },
      delete: {
        tags: ['Company Tax Details'],
        summary: 'Delete company tax detail by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company tax detail deleted successfully' },
          404: { description: 'Company tax detail not found' },
        },
      },
    },
    '/company-tax-details/company/{companyId}': {
      get: {
        tags: ['Company Tax Details'],
        summary: 'Get all tax details for a specific company',
        parameters: [
          {
            name: 'companyId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company tax details retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/company-tax-details/{id}/status': {
      patch: {
        tags: ['Company Tax Details'],
        summary: 'Update company tax detail active status',
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
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: false },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Company tax detail status updated successfully' },
          404: { description: 'Company tax detail not found' },
        },
      },
    },
    '/company-tax-details/{id}/primary': {
      patch: {
        tags: ['Company Tax Details'],
        summary: 'Set company tax detail as primary',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company tax detail set as primary successfully' },
          404: { description: 'Company tax detail not found' },
        },
      },
    },
    '/company-banks': {
      get: {
        tags: ['Company Banks'],
        summary: 'Get paginated list of company bank accounts',
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
            name: 'company_id',
            in: 'query',
            description: 'Filter by Company ID',
            schema: { type: 'integer' },
          },
          {
            name: 'account_type',
            in: 'query',
            description: 'Filter by account type',
            schema: {
              type: 'string',
              enum: ['savings', 'current', 'cash_credit', 'overdraft', 'other'],
            },
          },
          {
            name: 'is_primary',
            in: 'query',
            description: 'Filter by primary account flag',
            schema: { type: 'boolean' },
          },
          {
            name: 'is_active',
            in: 'query',
            description: 'Filter by active status',
            schema: { type: 'boolean' },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Search bank name, account number, holder, IFSC, or company',
            schema: { type: 'string' },
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: [
                'id',
                'company_id',
                'bank_name',
                'branch_name',
                'account_holder_name',
                'account_number',
                'account_type',
                'opening_balance',
                'current_balance',
                'created_at',
                'is_primary',
                'is_active',
              ],
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
            description: 'List of company bank accounts retrieved successfully',
          },
        },
      },
      post: {
        tags: ['Company Banks'],
        summary: 'Create a new company bank account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: [
                  'company_id',
                  'bank_name',
                  'account_holder_name',
                  'account_number',
                ],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  bank_name: { type: 'string', example: 'HDFC Bank' },
                  branch_name: { type: 'string', example: 'Hosur Main Branch' },
                  account_holder_name: {
                    type: 'string',
                    example: 'Pooja Fashion Shop Private Limited',
                  },
                  account_number: { type: 'string', example: '50200012345678' },
                  account_type: {
                    type: 'string',
                    enum: ['savings', 'current', 'cash_credit', 'overdraft', 'other'],
                    example: 'current',
                  },
                  ifsc_code: { type: 'string', example: 'HDFC0001234' },
                  micr_code: { type: 'string', example: '635240002' },
                  swift_code: { type: 'string', example: 'HDFCINBB' },
                  bank_code: { type: 'string', example: 'HDFC' },
                  branch_code: { type: 'string', example: '1234' },
                  opening_balance: { type: 'number', example: 50000 },
                  current_balance: { type: 'number', example: 50000 },
                  is_primary: { type: 'boolean', default: false },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Company bank account created successfully' },
          400: { description: 'Validation error' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/company-banks/{id}': {
      get: {
        tags: ['Company Banks'],
        summary: 'Get company bank account by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company bank account retrieved successfully' },
          404: { description: 'Company bank account not found' },
        },
      },
      put: {
        tags: ['Company Banks'],
        summary: 'Update company bank account by ID',
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
                  company_id: { type: 'integer' },
                  bank_name: { type: 'string' },
                  branch_name: { type: 'string' },
                  account_holder_name: { type: 'string' },
                  account_number: { type: 'string' },
                  account_type: {
                    type: 'string',
                    enum: ['savings', 'current', 'cash_credit', 'overdraft', 'other'],
                  },
                  ifsc_code: { type: 'string' },
                  micr_code: { type: 'string' },
                  swift_code: { type: 'string' },
                  bank_code: { type: 'string' },
                  branch_code: { type: 'string' },
                  opening_balance: { type: 'number' },
                  current_balance: { type: 'number' },
                  is_primary: { type: 'boolean' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Company bank account updated successfully' },
          404: { description: 'Company bank account not found' },
        },
      },
      delete: {
        tags: ['Company Banks'],
        summary: 'Delete company bank account by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company bank account deleted successfully' },
          404: { description: 'Company bank account not found' },
        },
      },
    },
    '/company-banks/company/{companyId}': {
      get: {
        tags: ['Company Banks'],
        summary: 'Get all bank accounts for a specific company',
        parameters: [
          {
            name: 'companyId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company bank accounts retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/company-banks/{id}/status': {
      patch: {
        tags: ['Company Banks'],
        summary: 'Update company bank account active status',
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
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: false },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Company bank account status updated successfully' },
          404: { description: 'Company bank account not found' },
        },
      },
    },
    '/company-banks/{id}/primary': {
      patch: {
        tags: ['Company Banks'],
        summary: 'Set company bank account as primary',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Company bank account set as primary successfully' },
          404: { description: 'Company bank account not found' },
        },
      },
    },
    '/banks': {
      get: {
        tags: ['Banks'],
        summary: 'Get paginated list of banks',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          {
            name: 'bank_type',
            in: 'query',
            schema: {
              type: 'string',
              enum: [
                'commercial',
                'cooperative',
                'regional_rural',
                'small_finance',
                'payments',
                'foreign',
                'other',
              ],
            },
          },
          { name: 'country_code', in: 'query', schema: { type: 'string', default: 'IN' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_verified', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: [
                'id',
                'bank_code',
                'bank_name',
                'short_name',
                'bank_type',
                'display_order',
                'created_at',
              ],
              default: 'display_order',
            },
          },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
        ],
        responses: { 200: { description: 'List of banks retrieved successfully' } },
      },
      post: {
        tags: ['Banks'],
        summary: 'Create a new bank master record',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bank_code', 'bank_name'],
                properties: {
                  bank_code: { type: 'string', example: 'HDFC' },
                  bank_name: { type: 'string', example: 'HDFC Bank' },
                  short_name: { type: 'string', example: 'HDFC' },
                  legal_name: { type: 'string', example: 'HDFC Bank Limited' },
                  bank_type: {
                    type: 'string',
                    enum: [
                      'commercial',
                      'cooperative',
                      'regional_rural',
                      'small_finance',
                      'payments',
                      'foreign',
                      'other',
                    ],
                    example: 'commercial',
                  },
                  logo_url: { type: 'string' },
                  website_url: { type: 'string', example: 'https://www.hdfcbank.com' },
                  country_code: { type: 'string', default: 'IN' },
                  is_active: { type: 'boolean', default: true },
                  is_verified: { type: 'boolean', default: true },
                  display_order: { type: 'integer', default: 1 },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Bank created successfully' }, 400: { description: 'Validation error' } },
      },
    },
    '/banks/{id}': {
      get: {
        tags: ['Banks'],
        summary: 'Get bank by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Bank retrieved successfully' }, 404: { description: 'Bank not found' } },
      },
      put: {
        tags: ['Banks'],
        summary: 'Update bank by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: { 200: { description: 'Bank updated successfully' }, 404: { description: 'Bank not found' } },
      },
      delete: {
        tags: ['Banks'],
        summary: 'Delete bank by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Bank deleted successfully' }, 404: { description: 'Bank not found' } },
      },
    },
    '/banks/code/{bankCode}': {
      get: {
        tags: ['Banks'],
        summary: 'Get bank by bank code',
        parameters: [{ name: 'bankCode', in: 'path', required: true, schema: { type: 'string', example: 'HDFC' } }],
        responses: { 200: { description: 'Bank retrieved successfully' }, 404: { description: 'Bank not found' } },
      },
    },
    '/banks/{id}/status': {
      patch: {
        tags: ['Banks'],
        summary: 'Update bank status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['is_active'], properties: { is_active: { type: 'boolean' } } },
            },
          },
        },
        responses: { 200: { description: 'Status updated' }, 404: { description: 'Bank not found' } },
      },
    },
    '/bank-identifiers': {
      get: {
        tags: ['Bank Identifiers'],
        summary: 'Get paginated list of bank identifiers',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'bank_id', in: 'query', schema: { type: 'integer' } },
          {
            name: 'identifier_type',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['ifsc', 'micr', 'swift', 'bank_code', 'routing_number', 'other'],
            },
          },
          { name: 'city', in: 'query', schema: { type: 'string' } },
          { name: 'state', in: 'query', schema: { type: 'string' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'List of bank identifiers retrieved successfully' } },
      },
      post: {
        tags: ['Bank Identifiers'],
        summary: 'Create a new bank identifier',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bank_id', 'identifier_type', 'identifier_value'],
                properties: {
                  bank_id: { type: 'integer', example: 1 },
                  identifier_type: {
                    type: 'string',
                    enum: ['ifsc', 'micr', 'swift', 'bank_code', 'routing_number', 'other'],
                    example: 'ifsc',
                  },
                  identifier_value: { type: 'string', example: 'HDFC0001234' },
                  branch_name: { type: 'string', example: 'Hosur Main Branch' },
                  city: { type: 'string', example: 'Hosur' },
                  state: { type: 'string', example: 'Tamil Nadu' },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Identifier created' }, 400: { description: 'Validation error' } },
      },
    },
    '/bank-identifiers/{id}': {
      get: {
        tags: ['Bank Identifiers'],
        summary: 'Get bank identifier by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Identifier retrieved successfully' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Bank Identifiers'],
        summary: 'Update bank identifier by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 200: { description: 'Identifier updated' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Bank Identifiers'],
        summary: 'Delete bank identifier by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Identifier deleted' }, 404: { description: 'Not found' } },
      },
    },
    '/bank-identifiers/bank/{bankId}': {
      get: {
        tags: ['Bank Identifiers'],
        summary: 'Get all identifiers for a bank',
        parameters: [{ name: 'bankId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Identifiers retrieved' }, 404: { description: 'Bank not found' } },
      },
    },
    '/bank-identifiers/value/{identifierValue}': {
      get: {
        tags: ['Bank Identifiers'],
        summary: 'Lookup bank branch by identifier code (e.g. IFSC)',
        parameters: [{ name: 'identifierValue', in: 'path', required: true, schema: { type: 'string', example: 'HDFC0001234' } }],
        responses: { 200: { description: 'Identifier retrieved' }, 404: { description: 'Not found' } },
      },
    },
    '/bank-identifiers/{id}/status': {
      patch: {
        tags: ['Bank Identifiers'],
        summary: 'Update bank identifier status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['is_active'], properties: { is_active: { type: 'boolean' } } },
            },
          },
        },
        responses: { 200: { description: 'Status updated' }, 404: { description: 'Not found' } },
      },
    },
  },
};

export default swaggerSpec;
