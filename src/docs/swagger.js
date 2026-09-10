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
      name: 'Branches',
      description: 'Branch master entity operations and auto-code generation',
    },
    {
      name: 'Branch Addresses',
      description: 'Branch physical and postal address management operations',
    },
    {
      name: 'Branch Contacts',
      description: 'Branch staff and manager contact management operations',
    },
    {
      name: 'Roles',
      description:
        'Role-based access control (RBAC) master entity operations, meaningful code generation, and system role seeding',
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
              enum: [
                'id',
                'company_id',
                'address_type',
                'city',
                'state',
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
                required: ['company_id', 'bank_name', 'account_holder_name', 'account_number'],
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
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
          },
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
            'multipart/form-data': {
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
                  website_url: { type: 'string', example: 'https://www.hdfcbank.com' },
                  country_code: { type: 'string', default: 'IN' },
                  is_active: { type: 'boolean', default: true },
                  is_verified: { type: 'boolean', default: true },
                  display_order: { type: 'integer', default: 1 },
                  logo: {
                    type: 'string',
                    format: 'binary',
                    description: 'Primary bank logo image',
                  },
                  logo_light: {
                    type: 'string',
                    format: 'binary',
                    description: 'Light mode logo image',
                  },
                  logo_dark: {
                    type: 'string',
                    format: 'binary',
                    description: 'Dark mode logo image',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Bank created successfully' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/banks/{id}': {
      get: {
        tags: ['Banks'],
        summary: 'Get bank by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Bank retrieved successfully' },
          404: { description: 'Bank not found' },
        },
      },
      put: {
        tags: ['Banks'],
        summary: 'Update bank by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { type: 'object' } },
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  bank_code: { type: 'string' },
                  bank_name: { type: 'string' },
                  short_name: { type: 'string' },
                  legal_name: { type: 'string' },
                  bank_type: { type: 'string' },
                  website_url: { type: 'string' },
                  country_code: { type: 'string' },
                  is_active: { type: 'boolean' },
                  is_verified: { type: 'boolean' },
                  display_order: { type: 'integer' },
                  logo: {
                    type: 'string',
                    format: 'binary',
                    description: 'Primary bank logo image',
                  },
                  logo_light: {
                    type: 'string',
                    format: 'binary',
                    description: 'Light mode logo image',
                  },
                  logo_dark: {
                    type: 'string',
                    format: 'binary',
                    description: 'Dark mode logo image',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Bank updated successfully' },
          404: { description: 'Bank not found' },
        },
      },
      delete: {
        tags: ['Banks'],
        summary: 'Delete bank by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Bank deleted successfully' },
          404: { description: 'Bank not found' },
        },
      },
    },
    '/banks/{id}/logo': {
      post: {
        tags: ['Banks'],
        summary: 'Upload or update bank logo images',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  logo: {
                    type: 'string',
                    format: 'binary',
                    description: 'Primary bank logo image',
                  },
                  logo_light: {
                    type: 'string',
                    format: 'binary',
                    description: 'Light theme logo image',
                  },
                  logo_dark: {
                    type: 'string',
                    format: 'binary',
                    description: 'Dark theme logo image',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Bank logo uploaded successfully' },
          400: { description: 'No file uploaded or invalid file format' },
          404: { description: 'Bank not found' },
        },
      },
      delete: {
        tags: ['Banks'],
        summary: 'Delete bank logo files from storage and reset URLs to null',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          {
            name: 'type',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['logo', 'logo_light', 'logo_dark', 'all'],
              default: 'all',
            },
            description: 'Which logo variant to delete (logo, logo_light, logo_dark, or all)',
          },
        ],
        responses: {
          200: { description: 'Bank logo deleted successfully' },
          404: { description: 'Bank not found' },
        },
      },
    },
    '/banks/code/{bankCode}': {
      get: {
        tags: ['Banks'],
        summary: 'Get bank by bank code',
        parameters: [
          {
            name: 'bankCode',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'HDFC' },
          },
        ],
        responses: {
          200: { description: 'Bank retrieved successfully' },
          404: { description: 'Bank not found' },
        },
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
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: { is_active: { type: 'boolean' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status updated' },
          404: { description: 'Bank not found' },
        },
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
        responses: {
          201: { description: 'Identifier created' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/bank-identifiers/{id}': {
      get: {
        tags: ['Bank Identifiers'],
        summary: 'Get bank identifier by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Identifier retrieved successfully' },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Bank Identifiers'],
        summary: 'Update bank identifier by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          200: { description: 'Identifier updated' },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Bank Identifiers'],
        summary: 'Delete bank identifier by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Identifier deleted' },
          404: { description: 'Not found' },
        },
      },
    },
    '/bank-identifiers/bank/{bankId}': {
      get: {
        tags: ['Bank Identifiers'],
        summary: 'Get all identifiers for a bank',
        parameters: [{ name: 'bankId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Identifiers retrieved' },
          404: { description: 'Bank not found' },
        },
      },
    },
    '/bank-identifiers/value/{identifierValue}': {
      get: {
        tags: ['Bank Identifiers'],
        summary: 'Lookup bank branch by identifier code (e.g. IFSC)',
        parameters: [
          {
            name: 'identifierValue',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'HDFC0001234' },
          },
        ],
        responses: {
          200: { description: 'Identifier retrieved' },
          404: { description: 'Not found' },
        },
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
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: { is_active: { type: 'boolean' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Status updated' }, 404: { description: 'Not found' } },
      },
    },
    '/branches': {
      get: {
        tags: ['Branches'],
        summary: 'Get paginated list of branches',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          {
            name: 'branch_type',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['head_office', 'store', 'warehouse', 'office', 'showroom', 'other'],
            },
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['active', 'inactive', 'closed'] },
          },
          { name: 'is_main_branch', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'List of branches retrieved successfully' } },
      },
      post: {
        tags: ['Branches'],
        summary: 'Create a new branch (auto-generates branch code if omitted)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'branch_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  branch_code: {
                    type: 'string',
                    example: 'PFS-B01',
                    description: 'Optional. Auto-generated if omitted.',
                  },
                  branch_name: { type: 'string', example: 'Hosur Main Branch' },
                  branch_type: {
                    type: 'string',
                    enum: ['head_office', 'store', 'warehouse', 'office', 'showroom', 'other'],
                    default: 'store',
                  },
                  email: { type: 'string', example: 'hosur@poojafashion.com' },
                  phone: { type: 'string', example: '+91 4344 223344' },
                  mobile: { type: 'string', example: '+91 9876543210' },
                  manager_name: { type: 'string', example: 'Kuralarasan' },
                  opening_date: { type: 'string', format: 'date', example: '2024-01-15' },
                  is_main_branch: { type: 'boolean', default: false },
                  status: {
                    type: 'string',
                    enum: ['active', 'inactive', 'closed'],
                    default: 'active',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Branch created successfully' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/branches/{id}': {
      get: {
        tags: ['Branches'],
        summary: 'Get branch by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Branch retrieved successfully' },
          404: { description: 'Branch not found' },
        },
      },
      put: {
        tags: ['Branches'],
        summary: 'Update branch by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          200: { description: 'Branch updated successfully' },
          404: { description: 'Branch not found' },
        },
      },
      delete: {
        tags: ['Branches'],
        summary: 'Delete branch by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Branch deleted successfully' },
          404: { description: 'Branch not found' },
        },
      },
    },
    '/branches/company/{companyId}': {
      get: {
        tags: ['Branches'],
        summary: 'Get all branches for a company',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Branches retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/branches/code/{companyId}/{branchCode}': {
      get: {
        tags: ['Branches'],
        summary: 'Get branch by company ID and branch code',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          {
            name: 'branchCode',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'PFS-B01' },
          },
        ],
        responses: {
          200: { description: 'Branch retrieved successfully' },
          404: { description: 'Branch not found' },
        },
      },
    },
    '/branches/{id}/status': {
      patch: {
        tags: ['Branches'],
        summary: 'Update branch status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: { status: { type: 'string', enum: ['active', 'inactive', 'closed'] } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status updated' },
          404: { description: 'Branch not found' },
        },
      },
    },
    '/branches/{id}/main': {
      patch: {
        tags: ['Branches'],
        summary: 'Set branch as main branch for the company',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Branch set as main branch' },
          404: { description: 'Branch not found' },
        },
      },
    },
    '/branch-addresses': {
      get: {
        tags: ['Branch Addresses'],
        summary: 'Get paginated list of branch addresses',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'branch_id', in: 'query', schema: { type: 'integer' } },
          { name: 'city', in: 'query', schema: { type: 'string' } },
          { name: 'state', in: 'query', schema: { type: 'string' } },
          { name: 'is_primary', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'List of branch addresses retrieved successfully' } },
      },
      post: {
        tags: ['Branch Addresses'],
        summary: 'Create a new branch address',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['branch_id', 'address_line_1'],
                properties: {
                  branch_id: { type: 'integer', example: 1 },
                  address_line_1: { type: 'string', example: '123 MG Road' },
                  address_line_2: { type: 'string', example: 'Opposite Bus Stand' },
                  city: { type: 'string', example: 'Hosur' },
                  district: { type: 'string', example: 'Krishnagiri' },
                  state: { type: 'string', example: 'Tamil Nadu' },
                  postal_code: { type: 'string', example: '635109' },
                  country: { type: 'string', default: 'India' },
                  landmark: { type: 'string', example: 'Near Clock Tower' },
                  is_primary: { type: 'boolean', default: true },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Branch address created' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/branch-addresses/{id}': {
      get: {
        tags: ['Branch Addresses'],
        summary: 'Get branch address by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Branch address retrieved successfully' },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Branch Addresses'],
        summary: 'Update branch address by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          200: { description: 'Branch address updated' },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Branch Addresses'],
        summary: 'Delete branch address by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Branch address deleted' },
          404: { description: 'Not found' },
        },
      },
    },
    '/branch-addresses/branch/{branchId}': {
      get: {
        tags: ['Branch Addresses'],
        summary: 'Get all addresses for a branch',
        parameters: [{ name: 'branchId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Addresses retrieved' },
          404: { description: 'Branch not found' },
        },
      },
    },
    '/branch-addresses/{id}/status': {
      patch: {
        tags: ['Branch Addresses'],
        summary: 'Update branch address active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: { is_active: { type: 'boolean' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Status updated' }, 404: { description: 'Not found' } },
      },
    },
    '/branch-addresses/{id}/primary': {
      patch: {
        tags: ['Branch Addresses'],
        summary: 'Set address as primary for the branch',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Address set as primary' },
          404: { description: 'Not found' },
        },
      },
    },
    '/branch-contacts': {
      get: {
        tags: ['Branch Contacts'],
        summary: 'Get paginated list of branch contacts',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'branch_id', in: 'query', schema: { type: 'integer' } },
          { name: 'designation', in: 'query', schema: { type: 'string' } },
          { name: 'is_primary', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'List of branch contacts retrieved successfully' } },
      },
      post: {
        tags: ['Branch Contacts'],
        summary: 'Create a new branch contact',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['branch_id', 'contact_name'],
                properties: {
                  branch_id: { type: 'integer', example: 1 },
                  contact_name: { type: 'string', example: 'Ramesh Kumar' },
                  designation: { type: 'string', example: 'Store Manager' },
                  email: { type: 'string', example: 'ramesh@poojafashion.com' },
                  phone: { type: 'string', example: '+91 4344 223344' },
                  mobile: { type: 'string', example: '+91 9876543211' },
                  is_primary: { type: 'boolean', default: false },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Branch contact created' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/branch-contacts/{id}': {
      get: {
        tags: ['Branch Contacts'],
        summary: 'Get branch contact by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Branch contact retrieved successfully' },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Branch Contacts'],
        summary: 'Update branch contact by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          200: { description: 'Branch contact updated' },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Branch Contacts'],
        summary: 'Delete branch contact by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Branch contact deleted' },
          404: { description: 'Not found' },
        },
      },
    },
    '/branch-contacts/branch/{branchId}': {
      get: {
        tags: ['Branch Contacts'],
        summary: 'Get all contacts for a branch',
        parameters: [{ name: 'branchId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Contacts retrieved' },
          404: { description: 'Branch not found' },
        },
      },
    },
    '/branch-contacts/{id}/status': {
      patch: {
        tags: ['Branch Contacts'],
        summary: 'Update branch contact active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: { is_active: { type: 'boolean' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Status updated' }, 404: { description: 'Not found' } },
      },
    },
    '/branch-contacts/{id}/primary': {
      patch: {
        tags: ['Branch Contacts'],
        summary: 'Set contact as primary for the branch',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Contact set as primary' },
          404: { description: 'Not found' },
        },
      },
    },
    '/roles': {
      get: {
        tags: ['Roles'],
        summary: 'Get paginated list of roles with filtering and search',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_system_role', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: [
                'id',
                'company_id',
                'role_code',
                'role_name',
                'is_system_role',
                'is_active',
                'created_at',
              ],
              default: 'id',
            },
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
          },
        ],
        responses: { 200: { description: 'Roles retrieved successfully' } },
      },
      post: {
        tags: ['Roles'],
        summary: 'Create a new role (auto-generates meaningful role code if omitted)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'role_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  role_name: { type: 'string', example: 'Store Manager' },
                  role_code: {
                    type: 'string',
                    example: 'STORE_MANAGER',
                    description:
                      'Optional. If omitted, a meaningful uppercase code will be automatically generated.',
                  },
                  description: { type: 'string', example: 'Branch retail operations supervisor' },
                  is_system_role: { type: 'boolean', default: false },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Role created successfully' },
          400: { description: 'Validation error or duplicate role name/code' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/roles/{id}': {
      get: {
        tags: ['Roles'],
        summary: 'Get role by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Role retrieved successfully' },
          404: { description: 'Role not found' },
        },
      },
      put: {
        tags: ['Roles'],
        summary: 'Update role details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  role_name: { type: 'string', example: 'Senior Store Manager' },
                  role_code: { type: 'string', example: 'SENIOR_STORE_MANAGER' },
                  description: { type: 'string', example: 'Updated role description' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Role updated successfully' },
          400: { description: 'Validation error' },
          403: { description: 'Cannot modify system role code' },
          404: { description: 'Role not found' },
        },
      },
      delete: {
        tags: ['Roles'],
        summary: 'Delete role by ID (System roles cannot be deleted)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Role deleted successfully' },
          403: { description: 'System roles cannot be deleted' },
          404: { description: 'Role not found' },
        },
      },
    },
    '/roles/company/{companyId}': {
      get: {
        tags: ['Roles'],
        summary: 'Get all roles for a company',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Roles retrieved' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/roles/code/{companyId}/{roleCode}': {
      get: {
        tags: ['Roles'],
        summary: 'Get role by company ID and role code',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          {
            name: 'roleCode',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'SUPERADMIN' },
          },
        ],
        responses: {
          200: { description: 'Role retrieved' },
          404: { description: 'Role not found' },
        },
      },
    },
    '/roles/{id}/status': {
      patch: {
        tags: ['Roles'],
        summary: 'Update role active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: { is_active: { type: 'boolean' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Role status updated' },
          403: { description: 'SUPERADMIN cannot be deactivated' },
          404: { description: 'Role not found' },
        },
      },
    },
    '/roles/company/{companyId}/seed-defaults': {
      post: {
        tags: ['Roles'],
        summary: 'Seed default system roles (SUPERADMIN and ADMIN) for a company',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Default system roles seeded successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
  },
};

export default swaggerSpec;
