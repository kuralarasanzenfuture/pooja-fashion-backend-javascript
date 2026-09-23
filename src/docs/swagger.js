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
      name: 'Authentication',
      description:
        'Enterprise JWT authentication, session tracking, token rotation, login history, and security policies',
    },
    {
      name: 'Users',
      description: 'Enterprise user accounts, security policies, password management, and profiles',
    },
    {
      name: 'Employees',
      description:
        'Staff management, auto-generated employee codes, profile photos, and employment details',
    },
    {
      name: 'System',
      description: 'System health and diagnostics',
    },
    {
      name: 'Product Master - Categories',
      description:
        'Product category master management, auto-generated category codes, display order, image uploads, and active status toggling',
    },
    {
      name: 'Product Master - Subcategories',
      description:
        'Product subcategory master operations, parent category links, auto code generation, image uploads, and status management',
    },
    {
      name: 'Product Master - Brands',
      description:
        'Product brand master management, brand codes, logo uploads, website links, display ordering, and active status toggling',
    },
    {
      name: 'Product Master - Size Groups',
      description:
        'Size group master management, standard apparel sizing categories, auto code generation, default size group seeding, and active status management',
    },
    {
      name: 'Product Master - Sizes',
      description:
        'Size master management, sizing values per size group (XS, S, M, L, XL, etc.), auto code generation, display order, and active status toggling',
    },
    {
      name: 'Product Master - Colors',
      description:
        'Color master management, color codes, hex codes, apparel color palettes, default color seeding, and active status toggling',
    },
    {
      name: 'Product Master - Materials',
      description:
        'Material and fabric blend master management, material codes, default fabric seeding, and active status toggling',
    },
    {
      name: 'Product Master - Units',
      description:
        'Units of measure (UOM) management, decimal precision configuration, standard unit seeding, and active status toggling',
    },
    {
      name: 'Product Master - Product Types',
      description:
        'Product classification and inventory/commercial behavior types (Ready-made, Fabric, Accessory, Footwear, Service), standard type seeding, and active status toggling',
    },
    {
      name: 'Product Master - Products',
      description:
        'Product master catalog management, auto-generated product codes, relational links to categories, subcategories, brands, product types, and default units, stock/variant flags, and status management',
    },
    {
      name: 'Product Master - Product Variants',
      description:
        'Product SKU and variant management, matrix attributes (size group, size, color, material, unit), barcode links, weight, inventory controls, and default variant switching',
    },
    {
      name: 'Product Master - Product Barcodes',
      description:
        'Barcode tracking, POS scanner lookup, multiple barcode symbologies (EAN, UPC, Code128, Code39, QR, Internal), and primary barcode assignment',
    },
    {
      name: 'Product Master - Product Images',
      description:
        'Product & variant image gallery management, isolated per-product storage subfolders (uploads/products/product-{id}/), physical file cleanup, and primary image controls',
    },
    {
      name: 'Product Master - Product Prices',
      description:
        'Product variant pricing management across retail, wholesale, special tiers, real-time POS active price lookup, and automated immutable audit trail tracking',
    },
    {
      name: 'Product Master - Taxes',
      description:
        'Tax master configuration, Indian GST slabs (0%, 5%, 12%, 18%, 28%), automatic CGST/SGST/IGST splitting, default tax seeding, and POS real-time tax calculation',
    },
    {
      name: 'Product Master - Product Taxes',
      description:
        'Mapping of tax slabs to products and variants, primary tax management, bulk tax assignment, and hierarchical POS checkout tax resolution',
    },
    {
      name: 'Product Master - Discounts',
      description:
        'Promotional campaign and coupon management, percentage and fixed deductions, maximum discount caps, volume purchase quantity thresholds, and POS checkout discount engine',
    },
    {
      name: 'Product Master - Product Discounts',
      description:
        'Mapping of discount campaigns to products and variants, primary discount designation, bulk discount assignment, and hierarchical POS checkout discount resolution',
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
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Get paginated list of users with multi-tenant filtering',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'branch_id', in: 'query', schema: { type: 'integer' } },
          { name: 'role_id', in: 'query', schema: { type: 'integer' } },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['active', 'inactive', 'blocked', 'locked'] },
          },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: [
                'id',
                'username',
                'email',
                'status',
                'company_id',
                'branch_id',
                'role_id',
                'created_at',
                'last_login_at',
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
        responses: {
          200: { description: 'Users retrieved successfully' },
          401: { description: 'Authentication required' },
          403: { description: 'Admin access required' },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create a new enterprise user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'username', 'password'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  branch_id: { type: 'integer', nullable: true, example: 1 },
                  role_id: { type: 'integer', nullable: true, example: 2 },
                  employee_id: { type: 'integer', nullable: true },
                  username: { type: 'string', example: 'store_manager' },
                  email: { type: 'string', format: 'email', example: 'manager@poojafashion.com' },
                  phone: { type: 'string', example: '+919876543210' },
                  password: { type: 'string', format: 'password', example: 'SecureP@ss123' },
                  profile_image_url: { type: 'string', nullable: true },
                  status: {
                    type: 'string',
                    enum: ['active', 'inactive', 'blocked', 'locked'],
                    default: 'active',
                  },
                  is_email_verified: { type: 'boolean', default: false },
                  is_phone_verified: { type: 'boolean', default: false },
                  two_factor_enabled: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User account created successfully' },
          400: { description: 'Validation failed or username/email duplicate' },
          401: { description: 'Authentication required' },
          403: { description: 'Admin access required' },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user profile by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'User retrieved successfully' },
          401: { description: 'Authentication required' },
          404: { description: 'User not found' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user account details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  branch_id: { type: 'integer', nullable: true },
                  role_id: { type: 'integer', nullable: true },
                  employee_id: { type: 'integer', nullable: true },
                  username: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  profile_image_url: { type: 'string', nullable: true },
                  is_email_verified: { type: 'boolean' },
                  is_phone_verified: { type: 'boolean' },
                  two_factor_enabled: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User updated successfully' },
          400: { description: 'Validation failed or duplicate constraint' },
          404: { description: 'User not found' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user account',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'User deleted successfully' },
          401: { description: 'Authentication required' },
          403: { description: 'Admin access required' },
          404: { description: 'User not found' },
        },
      },
    },
    '/users/{id}/password': {
      patch: {
        tags: ['Users'],
        summary: 'Change or reset user password',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['new_password'],
                properties: {
                  current_password: { type: 'string', format: 'password' },
                  new_password: { type: 'string', format: 'password', example: 'NewSecureP@ss123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password changed successfully' },
          400: { description: 'Validation failed or current password incorrect' },
          404: { description: 'User not found' },
        },
      },
    },
    '/users/{id}/status': {
      patch: {
        tags: ['Users'],
        summary: 'Update user account status (active, inactive, blocked, locked)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
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
                    enum: ['active', 'inactive', 'blocked', 'locked'],
                    example: 'locked',
                  },
                  lock_minutes: {
                    type: 'integer',
                    description: 'Lock duration in minutes (used when status is locked)',
                    example: 30,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User status updated successfully' },
          401: { description: 'Authentication required' },
          403: { description: 'Admin access required' },
          404: { description: 'User not found' },
        },
      },
    },
    '/employees': {
      get: {
        tags: ['Employees'],
        summary: 'Get paginated list of employees with multi-tenant filtering',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'branch_id', in: 'query', schema: { type: 'integer' } },
          { name: 'department', in: 'query', schema: { type: 'string' } },
          {
            name: 'employment_status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['active', 'inactive', 'on_leave', 'resigned', 'terminated'],
            },
          },
          {
            name: 'employment_type',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['full_time', 'part_time', 'temporary', 'contract', 'intern'],
            },
          },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: [
                'id',
                'employee_code',
                'first_name',
                'last_name',
                'display_name',
                'email',
                'phone',
                'department',
                'designation',
                'employment_status',
                'employment_type',
                'date_of_joining',
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
        responses: {
          200: { description: 'Employees retrieved successfully' },
          401: { description: 'Authentication required' },
          403: { description: 'Admin access required' },
        },
      },
      post: {
        tags: ['Employees'],
        summary:
          'Create new employee (auto-generates meaningful employee_code if omitted, supports photo upload)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'first_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  branch_id: { type: 'integer', nullable: true, example: 1 },
                  employee_code: {
                    type: 'string',
                    description: 'Optional; auto-generated (e.g. PFS-EMP001) if omitted',
                    example: 'PFS-EMP001',
                  },
                  first_name: { type: 'string', example: 'Kuralarasan' },
                  last_name: { type: 'string', example: 'Zen' },
                  display_name: { type: 'string', example: 'Kural Zen' },
                  phone: { type: 'string', example: '+919876543210' },
                  alternate_phone: { type: 'string' },
                  email: { type: 'string', format: 'email', example: 'kural@poojafashion.com' },
                  date_of_birth: { type: 'string', format: 'date', example: '1995-05-20' },
                  gender: { type: 'string', example: 'Male' },
                  designation: { type: 'string', example: 'Senior Manager' },
                  department: { type: 'string', example: 'Sales' },
                  date_of_joining: { type: 'string', format: 'date', example: '2024-01-15' },
                  employment_type: {
                    type: 'string',
                    enum: ['full_time', 'part_time', 'temporary', 'contract', 'intern'],
                    default: 'full_time',
                  },
                  employment_status: {
                    type: 'string',
                    enum: ['active', 'inactive', 'on_leave', 'resigned', 'terminated'],
                    default: 'active',
                  },
                  salary_type: { type: 'string', enum: ['monthly', 'daily', 'hourly'] },
                  salary_amount: { type: 'number', example: 45000 },
                  address: { type: 'string' },
                  city: { type: 'string', example: 'Hosur' },
                  district: { type: 'string', example: 'Krishnagiri' },
                  state: { type: 'string', example: 'Tamil Nadu' },
                  pincode: { type: 'string', example: '635109' },
                  country: { type: 'string', default: 'India' },
                  profile_photo_url: { type: 'string' },
                  username: {
                    type: 'string',
                    description: 'Optional username for photo naming or user account linkage',
                  },
                  emergency_contact_name: { type: 'string' },
                  emergency_contact_phone: { type: 'string' },
                  emergency_contact_relation: { type: 'string' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Employee created successfully' },
          400: { description: 'Validation failed or duplicate employee code/phone' },
          401: { description: 'Authentication required' },
          403: { description: 'Admin access required' },
        },
      },
    },
    '/employees/{id}': {
      get: {
        tags: ['Employees'],
        summary: 'Get employee details by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Employee retrieved successfully' },
          401: { description: 'Authentication required' },
          404: { description: 'Employee not found' },
        },
      },
      put: {
        tags: ['Employees'],
        summary: 'Update employee details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  branch_id: { type: 'integer', nullable: true },
                  employee_code: { type: 'string' },
                  first_name: { type: 'string' },
                  last_name: { type: 'string' },
                  display_name: { type: 'string' },
                  phone: { type: 'string' },
                  alternate_phone: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  date_of_birth: { type: 'string', format: 'date' },
                  gender: { type: 'string' },
                  designation: { type: 'string' },
                  department: { type: 'string' },
                  date_of_joining: { type: 'string', format: 'date' },
                  employment_type: {
                    type: 'string',
                    enum: ['full_time', 'part_time', 'temporary', 'contract', 'intern'],
                  },
                  employment_status: {
                    type: 'string',
                    enum: ['active', 'inactive', 'on_leave', 'resigned', 'terminated'],
                  },
                  salary_type: { type: 'string', enum: ['monthly', 'daily', 'hourly'] },
                  salary_amount: { type: 'number' },
                  address: { type: 'string' },
                  city: { type: 'string' },
                  district: { type: 'string' },
                  state: { type: 'string' },
                  pincode: { type: 'string' },
                  country: { type: 'string' },
                  profile_photo_url: { type: 'string' },
                  emergency_contact_name: { type: 'string' },
                  emergency_contact_phone: { type: 'string' },
                  emergency_contact_relation: { type: 'string' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Employee updated successfully' },
          400: { description: 'Validation failed' },
          404: { description: 'Employee not found' },
        },
      },
      delete: {
        tags: ['Employees'],
        summary: 'Remove employee record and photo',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Employee deleted successfully' },
          401: { description: 'Authentication required' },
          403: { description: 'Admin access required' },
          404: { description: 'Employee not found' },
        },
      },
    },
    '/employees/code/{companyId}/{employeeCode}': {
      get: {
        tags: ['Employees'],
        summary: 'Get employee by company ID and employee code',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'employeeCode', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Employee retrieved successfully' },
          404: { description: 'Employee not found' },
        },
      },
    },
    '/employees/{id}/photo': {
      post: {
        tags: ['Employees'],
        summary: 'Upload or replace employee profile photo',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  photo: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Photo uploaded successfully' },
          400: { description: 'Invalid photo file' },
          404: { description: 'Employee not found' },
        },
      },
      delete: {
        tags: ['Employees'],
        summary: 'Delete employee profile photo',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Photo removed successfully' },
          404: { description: 'Employee not found' },
        },
      },
    },
    '/employees/{id}/status': {
      patch: {
        tags: ['Employees'],
        summary: 'Update employee employment status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['employment_status'],
                properties: {
                  employment_status: {
                    type: 'string',
                    enum: ['active', 'inactive', 'on_leave', 'resigned', 'terminated'],
                    example: 'on_leave',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Employee status updated successfully' },
          401: { description: 'Authentication required' },
          403: { description: 'Admin access required' },
          404: { description: 'Employee not found' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate user credentials, start session, and issue access/refresh tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                  identifier: {
                    type: 'string',
                    description: 'Username, email address, or phone number',
                    example: 'admin',
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    example: 'P@ssword123',
                  },
                  company_id: {
                    type: 'integer',
                    description: 'Optional company ID for multi-tenant tenant isolation',
                    example: 1,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful with tokens and session' },
          401: { description: 'Invalid username or password' },
          403: { description: 'Account locked or suspended' },
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Authentication'],
        summary: 'Rotate refresh token and issue a fresh JWT access token',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refresh_token: {
                    type: 'string',
                    description:
                      'Refresh token string (optional if sent via HTTP-only refresh_token cookie)',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Token refreshed and rotated successfully' },
          401: { description: 'Invalid, expired, or reused refresh token' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current authenticated user profile and session info',
        responses: {
          200: { description: 'User profile retrieved successfully' },
          401: { description: 'Authentication required' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Terminate current session and clear auth cookies',
        responses: {
          200: { description: 'Logged out successfully' },
          401: { description: 'Authentication required' },
        },
      },
    },
    '/auth/logout-all': {
      post: {
        tags: ['Authentication'],
        summary: 'Terminate all active sessions across all devices for current user',
        responses: {
          200: { description: 'All sessions terminated successfully' },
          401: { description: 'Authentication required' },
        },
      },
    },
    '/auth/sessions': {
      get: {
        tags: ['Authentication'],
        summary: 'List all active sessions and device fingerprints for current user',
        responses: {
          200: { description: 'Active sessions retrieved successfully' },
          401: { description: 'Authentication required' },
        },
      },
    },
    '/auth/sessions/{id}': {
      delete: {
        tags: ['Authentication'],
        summary: 'Remotely terminate a specific session by UUID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Session UUID to revoke',
          },
        ],
        responses: {
          200: { description: 'Session revoked successfully' },
          401: { description: 'Authentication required' },
          404: { description: 'Session not found' },
        },
      },
    },
    '/auth/login-history': {
      get: {
        tags: ['Authentication'],
        summary: 'Get audit history of login attempts for current user',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['success', 'failed', 'blocked', 'locked', 'logout'],
            },
          },
        ],
        responses: {
          200: { description: 'Login history retrieved successfully' },
          401: { description: 'Authentication required' },
        },
      },
    },
    '/auth/change-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Change password with password history verification (prevents last 5 reuse)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['current_password', 'new_password'],
                properties: {
                  current_password: { type: 'string', format: 'password' },
                  new_password: {
                    type: 'string',
                    format: 'password',
                    example: 'NewSecurePass@123',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password changed successfully' },
          400: { description: 'Current password incorrect or new password was recently used' },
          401: { description: 'Authentication required' },
        },
      },
    },
    '/product-master/categories': {
      get: {
        tags: ['Product Master - Categories'],
        summary: 'List categories with pagination, search, and filtering',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'category_code', 'category_name', 'display_order', 'created_at', 'is_active'],
              default: 'display_order',
            },
          },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
        ],
        responses: {
          200: { description: 'Categories retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Categories'],
        summary: 'Create a new category (supports JSON or multipart image upload)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'category_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  category_code: { type: 'string', example: 'WOMENS_ETHNIC' },
                  category_name: { type: 'string', example: "Women's Ethnic Wear" },
                  description: { type: 'string', example: 'Traditional sarees, kurtis, lehengas' },
                  display_order: { type: 'integer', example: 1, default: 0 },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['company_id', 'category_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  category_code: { type: 'string', example: 'WOMENS_ETHNIC' },
                  category_name: { type: 'string', example: "Women's Ethnic Wear" },
                  description: { type: 'string', example: 'Traditional sarees, kurtis, lehengas' },
                  display_order: { type: 'integer', example: 1 },
                  is_active: { type: 'boolean', default: true },
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Category created successfully' },
          400: { description: 'Validation error or duplicate code/name' },
        },
      },
    },
    '/product-master/categories/{id}': {
      get: {
        tags: ['Product Master - Categories'],
        summary: 'Get category by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Category retrieved successfully' },
          404: { description: 'Category not found' },
        },
      },
      put: {
        tags: ['Product Master - Categories'],
        summary: 'Update category (supports JSON or multipart image replacement)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  category_code: { type: 'string' },
                  category_name: { type: 'string' },
                  description: { type: 'string' },
                  display_order: { type: 'integer' },
                  is_active: { type: 'boolean' },
                },
              },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  category_code: { type: 'string' },
                  category_name: { type: 'string' },
                  description: { type: 'string' },
                  display_order: { type: 'integer' },
                  is_active: { type: 'boolean' },
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Category updated successfully' },
          404: { description: 'Category not found' },
        },
      },
      delete: {
        tags: ['Product Master - Categories'],
        summary: 'Delete category (checks for child subcategories or products)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Category deleted successfully' },
          400: { description: 'Cannot delete category with dependent records' },
          404: { description: 'Category not found' },
        },
      },
    },
    '/product-master/categories/company/{companyId}': {
      get: {
        tags: ['Product Master - Categories'],
        summary: 'Get all categories for a specific company',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Company categories retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/categories/code/{companyId}/{categoryCode}': {
      get: {
        tags: ['Product Master - Categories'],
        summary: 'Get category by company ID and category code',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'categoryCode', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Category retrieved successfully' },
          404: { description: 'Category not found' },
        },
      },
    },
    '/product-master/categories/{id}/status': {
      patch: {
        tags: ['Product Master - Categories'],
        summary: 'Toggle or update category active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Category status updated successfully' },
          404: { description: 'Category not found' },
        },
      },
    },
    '/product-master/categories/{id}/image': {
      post: {
        tags: ['Product Master - Categories'],
        summary: 'Upload or replace category banner/thumbnail image',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Category image uploaded successfully' },
          404: { description: 'Category not found' },
        },
      },
      delete: {
        tags: ['Product Master - Categories'],
        summary: 'Delete category image',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Category image deleted successfully' },
          404: { description: 'Category not found' },
        },
      },
    },
    '/product-master/subcategories': {
      get: {
        tags: ['Product Master - Subcategories'],
        summary: 'List subcategories with pagination, search, and filtering',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'category_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'subcategory_code', 'subcategory_name', 'display_order', 'created_at', 'is_active'],
              default: 'display_order',
            },
          },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
        ],
        responses: {
          200: { description: 'Subcategories retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Subcategories'],
        summary: 'Create a new subcategory (supports JSON or multipart image upload)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'category_id', 'subcategory_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  category_id: { type: 'integer', example: 1 },
                  subcategory_code: { type: 'string', example: 'SILK_SAREES' },
                  subcategory_name: { type: 'string', example: 'Silk Sarees' },
                  description: { type: 'string', example: 'Pure Kanchipuram and Banarasi silk sarees' },
                  display_order: { type: 'integer', example: 1, default: 0 },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['company_id', 'category_id', 'subcategory_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  category_id: { type: 'integer', example: 1 },
                  subcategory_code: { type: 'string', example: 'SILK_SAREES' },
                  subcategory_name: { type: 'string', example: 'Silk Sarees' },
                  description: { type: 'string', example: 'Pure Kanchipuram and Banarasi silk sarees' },
                  display_order: { type: 'integer', example: 1 },
                  is_active: { type: 'boolean', default: true },
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Subcategory created successfully' },
          400: { description: 'Validation error or duplicate code/name' },
        },
      },
    },
    '/product-master/subcategories/{id}': {
      get: {
        tags: ['Product Master - Subcategories'],
        summary: 'Get subcategory by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Subcategory retrieved successfully' },
          404: { description: 'Subcategory not found' },
        },
      },
      put: {
        tags: ['Product Master - Subcategories'],
        summary: 'Update subcategory (supports JSON or multipart image replacement)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  category_id: { type: 'integer' },
                  subcategory_code: { type: 'string' },
                  subcategory_name: { type: 'string' },
                  description: { type: 'string' },
                  display_order: { type: 'integer' },
                  is_active: { type: 'boolean' },
                },
              },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  category_id: { type: 'integer' },
                  subcategory_code: { type: 'string' },
                  subcategory_name: { type: 'string' },
                  description: { type: 'string' },
                  display_order: { type: 'integer' },
                  is_active: { type: 'boolean' },
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Subcategory updated successfully' },
          404: { description: 'Subcategory not found' },
        },
      },
      delete: {
        tags: ['Product Master - Subcategories'],
        summary: 'Delete subcategory (checks for dependent child products)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Subcategory deleted successfully' },
          400: { description: 'Cannot delete subcategory with dependent products' },
          404: { description: 'Subcategory not found' },
        },
      },
    },
    '/product-master/subcategories/category/{categoryId}': {
      get: {
        tags: ['Product Master - Subcategories'],
        summary: 'Get all subcategories for a specific category',
        parameters: [
          { name: 'categoryId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Category subcategories retrieved successfully' },
          404: { description: 'Category not found' },
        },
      },
    },
    '/product-master/subcategories/company/{companyId}': {
      get: {
        tags: ['Product Master - Subcategories'],
        summary: 'Get all subcategories for a specific company',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Company subcategories retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/subcategories/code/{companyId}/{subcategoryCode}': {
      get: {
        tags: ['Product Master - Subcategories'],
        summary: 'Get subcategory by company ID and subcategory code',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'subcategoryCode', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Subcategory retrieved successfully' },
          404: { description: 'Subcategory not found' },
        },
      },
    },
    '/product-master/subcategories/{id}/status': {
      patch: {
        tags: ['Product Master - Subcategories'],
        summary: 'Toggle or update subcategory active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Subcategory status updated successfully' },
          404: { description: 'Subcategory not found' },
        },
      },
    },
    '/product-master/subcategories/{id}/image': {
      post: {
        tags: ['Product Master - Subcategories'],
        summary: 'Upload or replace subcategory image',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Subcategory image uploaded successfully' },
          404: { description: 'Subcategory not found' },
        },
      },
      delete: {
        tags: ['Product Master - Subcategories'],
        summary: 'Delete subcategory image',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Subcategory image deleted successfully' },
          404: { description: 'Subcategory not found' },
        },
      },
    },
    '/product-master/brands': {
      get: {
        tags: ['Product Master - Brands'],
        summary: 'List brands with pagination, search, and filtering',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'brand_code', 'brand_name', 'display_order', 'created_at', 'is_active'],
              default: 'display_order',
            },
          },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
        ],
        responses: {
          200: { description: 'Brands retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Brands'],
        summary: 'Create a new brand (supports JSON or multipart logo upload)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'brand_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  brand_code: { type: 'string', example: 'POOJA_EXCLUSIVE' },
                  brand_name: { type: 'string', example: 'Pooja Exclusive' },
                  description: { type: 'string', example: 'In-house luxury ethnic & bridal collection' },
                  website_url: { type: 'string', example: 'https://poojafashion.com' },
                  display_order: { type: 'integer', example: 1, default: 0 },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['company_id', 'brand_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  brand_code: { type: 'string', example: 'POOJA_EXCLUSIVE' },
                  brand_name: { type: 'string', example: 'Pooja Exclusive' },
                  description: { type: 'string', example: 'In-house luxury ethnic & bridal collection' },
                  website_url: { type: 'string', example: 'https://poojafashion.com' },
                  display_order: { type: 'integer', example: 1 },
                  is_active: { type: 'boolean', default: true },
                  logo: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Brand created successfully' },
          400: { description: 'Validation error or duplicate code/name' },
        },
      },
    },
    '/product-master/brands/{id}': {
      get: {
        tags: ['Product Master - Brands'],
        summary: 'Get brand by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Brand retrieved successfully' },
          404: { description: 'Brand not found' },
        },
      },
      put: {
        tags: ['Product Master - Brands'],
        summary: 'Update brand (supports JSON or multipart logo replacement)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  brand_code: { type: 'string' },
                  brand_name: { type: 'string' },
                  description: { type: 'string' },
                  website_url: { type: 'string' },
                  display_order: { type: 'integer' },
                  is_active: { type: 'boolean' },
                },
              },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  brand_code: { type: 'string' },
                  brand_name: { type: 'string' },
                  description: { type: 'string' },
                  website_url: { type: 'string' },
                  display_order: { type: 'integer' },
                  is_active: { type: 'boolean' },
                  logo: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Brand updated successfully' },
          404: { description: 'Brand not found' },
        },
      },
      delete: {
        tags: ['Product Master - Brands'],
        summary: 'Delete brand (checks for dependent child products)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Brand deleted successfully' },
          400: { description: 'Cannot delete brand with dependent products' },
          404: { description: 'Brand not found' },
        },
      },
    },
    '/product-master/brands/company/{companyId}': {
      get: {
        tags: ['Product Master - Brands'],
        summary: 'Get all brands for a specific company',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Company brands retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/brands/code/{companyId}/{brandCode}': {
      get: {
        tags: ['Product Master - Brands'],
        summary: 'Get brand by company ID and brand code',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'brandCode', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Brand retrieved successfully' },
          404: { description: 'Brand not found' },
        },
      },
    },
    '/product-master/brands/{id}/status': {
      patch: {
        tags: ['Product Master - Brands'],
        summary: 'Toggle or update brand active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Brand status updated successfully' },
          404: { description: 'Brand not found' },
        },
      },
    },
    '/product-master/brands/{id}/logo': {
      post: {
        tags: ['Product Master - Brands'],
        summary: 'Upload or replace brand logo',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['logo'],
                properties: {
                  logo: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Brand logo uploaded successfully' },
          404: { description: 'Brand not found' },
        },
      },
      delete: {
        tags: ['Product Master - Brands'],
        summary: 'Delete brand logo',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Brand logo deleted successfully' },
          404: { description: 'Brand not found' },
        },
      },
    },
    '/product-master/size-groups': {
      get: {
        tags: ['Product Master - Size Groups'],
        summary: 'List size groups with pagination, search, and filtering',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'size_group_code', 'size_group_name', 'created_at', 'is_active'],
              default: 'size_group_name',
            },
          },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
        ],
        responses: {
          200: { description: 'Size groups retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Size Groups'],
        summary: 'Create a new size group',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'size_group_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  size_group_code: { type: 'string', example: 'MEN' },
                  size_group_name: { type: 'string', example: 'Men' },
                  description: { type: 'string', example: 'Standard menswear apparel sizing' },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Size group created successfully' },
          400: { description: 'Validation error or duplicate code/name' },
        },
      },
    },
    '/product-master/size-groups/{id}': {
      get: {
        tags: ['Product Master - Size Groups'],
        summary: 'Get size group by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Size group retrieved successfully' },
          404: { description: 'Size group not found' },
        },
      },
      put: {
        tags: ['Product Master - Size Groups'],
        summary: 'Update existing size group',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  size_group_code: { type: 'string' },
                  size_group_name: { type: 'string' },
                  description: { type: 'string' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Size group updated successfully' },
          404: { description: 'Size group not found' },
        },
      },
      delete: {
        tags: ['Product Master - Size Groups'],
        summary: 'Delete size group (checks for child sizes)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Size group deleted successfully' },
          400: { description: 'Cannot delete size group with dependent sizes' },
          404: { description: 'Size group not found' },
        },
      },
    },
    '/product-master/size-groups/company/{companyId}': {
      get: {
        tags: ['Product Master - Size Groups'],
        summary: 'Get all size groups for a specific company',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Company size groups retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/size-groups/code/{companyId}/{sizeGroupCode}': {
      get: {
        tags: ['Product Master - Size Groups'],
        summary: 'Get size group by company ID and size group code',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'sizeGroupCode', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Size group retrieved successfully' },
          404: { description: 'Size group not found' },
        },
      },
    },
    '/product-master/size-groups/{id}/status': {
      patch: {
        tags: ['Product Master - Size Groups'],
        summary: 'Toggle or update size group active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Size group status updated successfully' },
          404: { description: 'Size group not found' },
        },
      },
    },
    '/product-master/size-groups/company/{companyId}/seed-defaults': {
      post: {
        tags: ['Product Master - Size Groups'],
        summary: 'Seed default standard size groups (Men, Women, Kids, Infants, Footwear)',
        parameters: [{ name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          201: { description: 'Default size groups seeded successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/sizes': {
      get: {
        tags: ['Product Master - Sizes'],
        summary: 'List sizes with pagination, search, and filtering',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'size_group_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'size_code', 'size_name', 'display_order', 'created_at', 'is_active'],
              default: 'display_order',
            },
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
          },
        ],
        responses: {
          200: { description: 'Sizes retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Sizes'],
        summary: 'Create a new size',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'size_group_id', 'size_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  size_group_id: { type: 'integer', example: 1 },
                  size_code: { type: 'string', example: 'M' },
                  size_name: { type: 'string', example: 'Medium' },
                  display_order: { type: 'integer', example: 2 },
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Size created successfully' },
          400: { description: 'Validation failed or duplicate code/name in size group' },
          404: { description: 'Company or size group not found' },
        },
      },
    },
    '/product-master/sizes/{id}': {
      get: {
        tags: ['Product Master - Sizes'],
        summary: 'Get size by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Size retrieved successfully' },
          404: { description: 'Size not found' },
        },
      },
      put: {
        tags: ['Product Master - Sizes'],
        summary: 'Update existing size',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  company_id: { type: 'integer' },
                  size_group_id: { type: 'integer' },
                  size_code: { type: 'string' },
                  size_name: { type: 'string' },
                  display_order: { type: 'integer' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Size updated successfully' },
          400: { description: 'Validation failed or duplicate code/name' },
          404: { description: 'Size not found' },
        },
      },
      delete: {
        tags: ['Product Master - Sizes'],
        summary: 'Delete size (checks for dependent product variants)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Size deleted successfully' },
          400: { description: 'Cannot delete size assigned to product variants' },
          404: { description: 'Size not found' },
        },
      },
    },
    '/product-master/sizes/company/{companyId}': {
      get: {
        tags: ['Product Master - Sizes'],
        summary: 'Get all sizes for a specific company',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Company sizes retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/sizes/size-group/{sizeGroupId}': {
      get: {
        tags: ['Product Master - Sizes'],
        summary: 'Get all sizes for a specific size group',
        parameters: [
          { name: 'sizeGroupId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Size group sizes retrieved successfully' },
          404: { description: 'Size group not found' },
        },
      },
    },
    '/product-master/sizes/code/{sizeGroupId}/{sizeCode}': {
      get: {
        tags: ['Product Master - Sizes'],
        summary: 'Get size by size group ID and size code',
        parameters: [
          { name: 'sizeGroupId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'sizeCode', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Size retrieved successfully' },
          404: { description: 'Size not found' },
        },
      },
    },
    '/product-master/sizes/{id}/status': {
      patch: {
        tags: ['Product Master - Sizes'],
        summary: 'Toggle or update size active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Size status updated successfully' },
          404: { description: 'Size not found' },
        },
      },
    },
    '/product-master/colors': {
      get: {
        tags: ['Product Master - Colors'],
        summary: 'List colors with pagination, search, and filtering',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'color_code', 'color_name', 'display_order', 'created_at', 'is_active'],
              default: 'display_order',
            },
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
          },
        ],
        responses: {
          200: { description: 'Colors retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Colors'],
        summary: 'Create a new color',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'color_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  color_code: { type: 'string', example: 'BLK' },
                  color_name: { type: 'string', example: 'Black' },
                  hex_code: { type: 'string', example: '#000000' },
                  description: { type: 'string', example: 'Solid Black' },
                  display_order: { type: 'integer', example: 1 },
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Color created successfully' },
          400: { description: 'Validation failed or duplicate code/name in company' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/colors/{id}': {
      get: {
        tags: ['Product Master - Colors'],
        summary: 'Get color by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Color retrieved successfully' },
          404: { description: 'Color not found' },
        },
      },
      put: {
        tags: ['Product Master - Colors'],
        summary: 'Update existing color',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  company_id: { type: 'integer' },
                  color_code: { type: 'string' },
                  color_name: { type: 'string' },
                  hex_code: { type: 'string' },
                  description: { type: 'string' },
                  display_order: { type: 'integer' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Color updated successfully' },
          400: { description: 'Validation failed or duplicate code/name' },
          404: { description: 'Color not found' },
        },
      },
      delete: {
        tags: ['Product Master - Colors'],
        summary: 'Delete color (checks for dependent product variants)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Color deleted successfully' },
          400: { description: 'Cannot delete color assigned to product variants' },
          404: { description: 'Color not found' },
        },
      },
    },
    '/product-master/colors/company/{companyId}': {
      get: {
        tags: ['Product Master - Colors'],
        summary: 'Get all colors for a specific company',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Company colors retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/colors/code/{companyId}/{colorCode}': {
      get: {
        tags: ['Product Master - Colors'],
        summary: 'Get color by company ID and color code',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'colorCode', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Color retrieved successfully' },
          404: { description: 'Color not found' },
        },
      },
    },
    '/product-master/colors/{id}/status': {
      patch: {
        tags: ['Product Master - Colors'],
        summary: 'Toggle or update color active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Color status updated successfully' },
          404: { description: 'Color not found' },
        },
      },
    },
    '/product-master/colors/company/{companyId}/seed-defaults': {
      post: {
        tags: ['Product Master - Colors'],
        summary: 'Seed standard default apparel colors (Black, White, Navy Blue, Red, Royal Blue, etc.)',
        parameters: [{ name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          201: { description: 'Default colors seeded successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/materials': {
      get: {
        tags: ['Product Master - Materials'],
        summary: 'List materials with pagination, search, and filtering',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'material_code', 'material_name', 'created_at', 'is_active'],
              default: 'material_name',
            },
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
          },
        ],
        responses: {
          200: { description: 'Materials retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Materials'],
        summary: 'Create a new material',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'material_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  material_code: { type: 'string', example: 'COTTON' },
                  material_name: { type: 'string', example: '100% Cotton' },
                  description: { type: 'string', example: 'Natural breathable cotton' },
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Material created successfully' },
          400: { description: 'Validation failed or duplicate code/name in company' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/materials/{id}': {
      get: {
        tags: ['Product Master - Materials'],
        summary: 'Get material by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Material retrieved successfully' },
          404: { description: 'Material not found' },
        },
      },
      put: {
        tags: ['Product Master - Materials'],
        summary: 'Update existing material',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  company_id: { type: 'integer' },
                  material_code: { type: 'string' },
                  material_name: { type: 'string' },
                  description: { type: 'string' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Material updated successfully' },
          400: { description: 'Validation failed or duplicate code/name' },
          404: { description: 'Material not found' },
        },
      },
      delete: {
        tags: ['Product Master - Materials'],
        summary: 'Delete material (checks for dependent product variants)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Material deleted successfully' },
          400: { description: 'Cannot delete material assigned to product variants' },
          404: { description: 'Material not found' },
        },
      },
    },
    '/product-master/materials/company/{companyId}': {
      get: {
        tags: ['Product Master - Materials'],
        summary: 'Get all materials for a specific company',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Company materials retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/materials/code/{companyId}/{materialCode}': {
      get: {
        tags: ['Product Master - Materials'],
        summary: 'Get material by company ID and material code',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'materialCode', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Material retrieved successfully' },
          404: { description: 'Material not found' },
        },
      },
    },
    '/product-master/materials/{id}/status': {
      patch: {
        tags: ['Product Master - Materials'],
        summary: 'Toggle or update material active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Material status updated successfully' },
          404: { description: 'Material not found' },
        },
      },
    },
    '/product-master/materials/company/{companyId}/seed-defaults': {
      post: {
        tags: ['Product Master - Materials'],
        summary: 'Seed standard default apparel fabrics (Cotton, Polyester, Silk, Linen, Denim, etc.)',
        parameters: [{ name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          201: { description: 'Default materials seeded successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/units': {
      get: {
        tags: ['Product Master - Units'],
        summary: 'List units with pagination, search, and filtering',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'unit_code', 'unit_name', 'decimal_places', 'created_at', 'is_active'],
              default: 'unit_name',
            },
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
          },
        ],
        responses: {
          200: { description: 'Units retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Units'],
        summary: 'Create a new unit of measure',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'unit_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  unit_code: { type: 'string', example: 'PCS' },
                  unit_name: { type: 'string', example: 'Pieces' },
                  decimal_places: { type: 'integer', example: 0, minimum: 0, maximum: 6 },
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Unit created successfully' },
          400: { description: 'Validation failed or duplicate code/name in company' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/units/{id}': {
      get: {
        tags: ['Product Master - Units'],
        summary: 'Get unit by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Unit retrieved successfully' },
          404: { description: 'Unit not found' },
        },
      },
      put: {
        tags: ['Product Master - Units'],
        summary: 'Update existing unit',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  company_id: { type: 'integer' },
                  unit_code: { type: 'string' },
                  unit_name: { type: 'string' },
                  decimal_places: { type: 'integer', minimum: 0, maximum: 6 },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Unit updated successfully' },
          400: { description: 'Validation failed or duplicate code/name' },
          404: { description: 'Unit not found' },
        },
      },
      delete: {
        tags: ['Product Master - Units'],
        summary: 'Delete unit (checks for dependent products and variants)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Unit deleted successfully' },
          400: { description: 'Cannot delete unit assigned to products or variants' },
          404: { description: 'Unit not found' },
        },
      },
    },
    '/product-master/units/company/{companyId}': {
      get: {
        tags: ['Product Master - Units'],
        summary: 'Get all units for a specific company',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Company units retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/units/code/{companyId}/{unitCode}': {
      get: {
        tags: ['Product Master - Units'],
        summary: 'Get unit by company ID and unit code',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'unitCode', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Unit retrieved successfully' },
          404: { description: 'Unit not found' },
        },
      },
    },
    '/product-master/units/{id}/status': {
      patch: {
        tags: ['Product Master - Units'],
        summary: 'Toggle or update unit active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Unit status updated successfully' },
          404: { description: 'Unit not found' },
        },
      },
    },
    '/product-master/units/company/{companyId}/seed-defaults': {
      post: {
        tags: ['Product Master - Units'],
        summary: 'Seed standard default units of measure (PCS, PAIR, SET, METER, KG, BOX, DOZEN, ROLL)',
        parameters: [{ name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          201: { description: 'Default units seeded successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/product-types': {
      get: {
        tags: ['Product Master - Product Types'],
        summary: 'List product types with pagination, search, and filtering',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_stock_item', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_saleable', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_purchasable', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'type_code', 'type_name', 'created_at', 'is_active'],
              default: 'type_name',
            },
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
          },
        ],
        responses: {
          200: { description: 'Product types retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Product Types'],
        summary: 'Create a new product type',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'type_name'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  type_code: { type: 'string', example: 'READY_MADE' },
                  type_name: { type: 'string', example: 'Ready Made Garments' },
                  description: { type: 'string', example: 'Finished apparel' },
                  is_stock_item: { type: 'boolean', example: true },
                  is_saleable: { type: 'boolean', example: true },
                  is_purchasable: { type: 'boolean', example: true },
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Product type created successfully' },
          400: { description: 'Validation failed or duplicate code/name in company' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/product-types/{id}': {
      get: {
        tags: ['Product Master - Product Types'],
        summary: 'Get product type by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product type retrieved successfully' },
          404: { description: 'Product type not found' },
        },
      },
      put: {
        tags: ['Product Master - Product Types'],
        summary: 'Update existing product type',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  company_id: { type: 'integer' },
                  type_code: { type: 'string' },
                  type_name: { type: 'string' },
                  description: { type: 'string' },
                  is_stock_item: { type: 'boolean' },
                  is_saleable: { type: 'boolean' },
                  is_purchasable: { type: 'boolean' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product type updated successfully' },
          400: { description: 'Validation failed or duplicate code/name' },
          404: { description: 'Product type not found' },
        },
      },
      delete: {
        tags: ['Product Master - Product Types'],
        summary: 'Delete product type (checks for dependent products)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product type deleted successfully' },
          400: { description: 'Cannot delete product type assigned to products' },
          404: { description: 'Product type not found' },
        },
      },
    },
    '/product-master/product-types/company/{companyId}': {
      get: {
        tags: ['Product Master - Product Types'],
        summary: 'Get all product types for a specific company',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Company product types retrieved successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/product-types/code/{companyId}/{typeCode}': {
      get: {
        tags: ['Product Master - Product Types'],
        summary: 'Get product type by company ID and type code',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'typeCode', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Product type retrieved successfully' },
          404: { description: 'Product type not found' },
        },
      },
    },
    '/product-master/product-types/{id}/status': {
      patch: {
        tags: ['Product Master - Product Types'],
        summary: 'Toggle or update product type active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product type status updated successfully' },
          404: { description: 'Product type not found' },
        },
      },
    },
    '/product-master/product-types/company/{companyId}/seed-defaults': {
      post: {
        tags: ['Product Master - Product Types'],
        summary: 'Seed standard default product types (READY_MADE, FABRIC, ACCESSORY, FOOTWEAR, SERVICE)',
        parameters: [{ name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          201: { description: 'Default product types seeded successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/product-master/products': {
      get: {
        tags: ['Product Master - Products'],
        summary: 'Get paginated list of products with filters and search',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'category_id', in: 'query', schema: { type: 'integer' } },
          { name: 'subcategory_id', in: 'query', schema: { type: 'integer' } },
          { name: 'brand_id', in: 'query', schema: { type: 'integer' } },
          { name: 'product_type_id', in: 'query', schema: { type: 'integer' } },
          { name: 'default_unit_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_variant_product', in: 'query', schema: { type: 'boolean' } },
          { name: 'track_stock', in: 'query', schema: { type: 'boolean' } },
          { name: 'allow_negative_stock', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'product_code', 'product_name', 'category_id', 'subcategory_id', 'brand_id', 'product_type_id', 'default_unit_id', 'is_active', 'created_at'],
              default: 'product_name',
            },
          },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
        ],
        responses: {
          200: { description: 'Products retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Products'],
        summary: 'Create a new product',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'product_name', 'category_id', 'default_unit_id'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  product_code: { type: 'string', example: 'SILK_ANARKALI_01' },
                  product_name: { type: 'string', example: 'Embroidered Silk Anarkali Suit' },
                  category_id: { type: 'integer', example: 1 },
                  subcategory_id: { type: 'integer', nullable: true, example: 1 },
                  brand_id: { type: 'integer', nullable: true, example: 1 },
                  product_type_id: { type: 'integer', nullable: true, example: 1 },
                  description: { type: 'string', example: 'Handcrafted premium silk suit with intricate zari embroidery.' },
                  short_description: { type: 'string', example: 'Designer silk anarkali suit' },
                  manufacturer_name: { type: 'string', example: 'Pooja Fashion Crafts Ltd' },
                  manufacturer_part_no: { type: 'string', example: 'PFC-ANK-2026' },
                  default_unit_id: { type: 'integer', example: 1 },
                  is_variant_product: { type: 'boolean', default: true },
                  track_stock: { type: 'boolean', default: true },
                  allow_negative_stock: { type: 'boolean', default: false },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Product created successfully' },
          400: { description: 'Validation failed or duplicate product code' },
          404: { description: 'Company, category, subcategory, brand, product type, or unit not found' },
        },
      },
    },
    '/product-master/products/{id}': {
      get: {
        tags: ['Product Master - Products'],
        summary: 'Get single product by ID with full relations',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product retrieved successfully' },
          404: { description: 'Product not found' },
        },
      },
      put: {
        tags: ['Product Master - Products'],
        summary: 'Update existing product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  company_id: { type: 'integer' },
                  product_code: { type: 'string' },
                  product_name: { type: 'string' },
                  category_id: { type: 'integer' },
                  subcategory_id: { type: 'integer', nullable: true },
                  brand_id: { type: 'integer', nullable: true },
                  product_type_id: { type: 'integer', nullable: true },
                  description: { type: 'string' },
                  short_description: { type: 'string' },
                  manufacturer_name: { type: 'string' },
                  manufacturer_part_no: { type: 'string' },
                  default_unit_id: { type: 'integer' },
                  is_variant_product: { type: 'boolean' },
                  track_stock: { type: 'boolean' },
                  allow_negative_stock: { type: 'boolean' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product updated successfully' },
          400: { description: 'Validation failed, code already exists, or relation mismatch' },
          404: { description: 'Product or referenced entity not found' },
        },
      },
      delete: {
        tags: ['Product Master - Products'],
        summary: 'Delete product (safeguards against deleting products with active variants)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product deleted successfully' },
          400: { description: 'Cannot delete product with associated product variants' },
          404: { description: 'Product not found' },
        },
      },
    },
    '/product-master/products/company/{companyId}/code/{productCode}': {
      get: {
        tags: ['Product Master - Products'],
        summary: 'Get product by company ID and product code',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'productCode', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Product retrieved successfully' },
          404: { description: 'Product not found' },
        },
      },
    },
    '/product-master/products/{id}/status': {
      patch: {
        tags: ['Product Master - Products'],
        summary: 'Toggle or update product active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product status updated successfully' },
          404: { description: 'Product not found' },
        },
      },
    },
    '/product-master/product-variants': {
      get: {
        tags: ['Product Master - Product Variants'],
        summary: 'Get paginated list of product variants with filters and search',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'product_id', in: 'query', schema: { type: 'integer' } },
          { name: 'size_group_id', in: 'query', schema: { type: 'integer' } },
          { name: 'size_id', in: 'query', schema: { type: 'integer' } },
          { name: 'color_id', in: 'query', schema: { type: 'integer' } },
          { name: 'material_id', in: 'query', schema: { type: 'integer' } },
          { name: 'unit_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_default', in: 'query', schema: { type: 'boolean' } },
          { name: 'track_stock', in: 'query', schema: { type: 'boolean' } },
          { name: 'allow_negative_stock', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'sku', 'variant_code', 'variant_name', 'product_id', 'size_group_id', 'size_id', 'color_id', 'material_id', 'unit_id', 'weight', 'is_default', 'is_active', 'created_at'],
              default: 'sku',
            },
          },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
        ],
        responses: {
          200: { description: 'Product variants retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Product Variants'],
        summary: 'Create a new product variant',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'product_id'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  product_id: { type: 'integer', example: 1 },
                  sku: { type: 'string', example: 'SILK-ANK-M-RED' },
                  variant_code: { type: 'string', example: 'M-RED' },
                  variant_name: { type: 'string', example: 'Silk Anarkali - M / Red' },
                  size_group_id: { type: 'integer', nullable: true, example: 1 },
                  size_id: { type: 'integer', nullable: true, example: 2 },
                  color_id: { type: 'integer', nullable: true, example: 1 },
                  material_id: { type: 'integer', nullable: true, example: 1 },
                  unit_id: { type: 'integer', example: 1 },
                  model_no: { type: 'string', example: 'MDL-2026-01' },
                  style_code: { type: 'string', example: 'STL-ANK-01' },
                  weight: { type: 'number', example: 0.65 },
                  track_stock: { type: 'boolean', default: true },
                  allow_negative_stock: { type: 'boolean', default: false },
                  is_default: { type: 'boolean', default: false },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Product variant created successfully' },
          400: { description: 'Validation failed or duplicate SKU' },
          404: { description: 'Referenced entity not found' },
        },
      },
    },
    '/product-master/product-variants/{id}': {
      get: {
        tags: ['Product Master - Product Variants'],
        summary: 'Get single product variant by ID with full relations',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product variant retrieved successfully' },
          404: { description: 'Product variant not found' },
        },
      },
      put: {
        tags: ['Product Master - Product Variants'],
        summary: 'Update existing product variant',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  company_id: { type: 'integer' },
                  product_id: { type: 'integer' },
                  sku: { type: 'string' },
                  variant_code: { type: 'string' },
                  variant_name: { type: 'string' },
                  size_group_id: { type: 'integer', nullable: true },
                  size_id: { type: 'integer', nullable: true },
                  color_id: { type: 'integer', nullable: true },
                  material_id: { type: 'integer', nullable: true },
                  unit_id: { type: 'integer' },
                  model_no: { type: 'string' },
                  style_code: { type: 'string' },
                  weight: { type: 'number' },
                  track_stock: { type: 'boolean' },
                  allow_negative_stock: { type: 'boolean' },
                  is_default: { type: 'boolean' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product variant updated successfully' },
          400: { description: 'Validation failed or SKU already exists' },
          404: { description: 'Variant or referenced entity not found' },
        },
      },
      delete: {
        tags: ['Product Master - Product Variants'],
        summary: 'Delete product variant (safeguards against deleting variants with price histories)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product variant deleted successfully' },
          400: { description: 'Cannot delete variant with price history records' },
          404: { description: 'Product variant not found' },
        },
      },
    },
    '/product-master/product-variants/product/{productId}': {
      get: {
        tags: ['Product Master - Product Variants'],
        summary: 'Get all product variants for a specific product',
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Product variants retrieved successfully' },
          404: { description: 'Product not found' },
        },
      },
    },
    '/product-master/product-variants/company/{companyId}/sku/{sku}': {
      get: {
        tags: ['Product Master - Product Variants'],
        summary: 'Get product variant by company ID and SKU',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'sku', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Product variant retrieved successfully' },
          404: { description: 'Product variant not found' },
        },
      },
    },
    '/product-master/product-variants/{id}/status': {
      patch: {
        tags: ['Product Master - Product Variants'],
        summary: 'Toggle or update product variant active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product variant status updated successfully' },
          404: { description: 'Product variant not found' },
        },
      },
    },
    '/product-master/product-variants/{id}/set-default': {
      post: {
        tags: ['Product Master - Product Variants'],
        summary: 'Designate product variant as the default variant for its product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Default product variant set successfully' },
          404: { description: 'Product variant not found' },
        },
      },
    },
    '/product-master/product-barcodes': {
      get: {
        tags: ['Product Master - Product Barcodes'],
        summary: 'Get paginated list of product barcodes with filters and search',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'product_id', in: 'query', schema: { type: 'integer' } },
          { name: 'variant_id', in: 'query', schema: { type: 'integer' } },
          { name: 'barcode_type', in: 'query', schema: { type: 'string' } },
          { name: 'is_primary', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'barcode', 'barcode_type', 'product_id', 'variant_id', 'is_primary', 'is_active', 'created_at'],
              default: 'id',
            },
          },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: { description: 'Product barcodes retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Product Barcodes'],
        summary: 'Create a new product barcode',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'product_id', 'variant_id'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  product_id: { type: 'integer', example: 1 },
                  variant_id: { type: 'integer', example: 1 },
                  barcode: { type: 'string', example: '8901234567890' },
                  barcode_type: { type: 'string', example: 'EAN13', default: 'INTERNAL' },
                  is_primary: { type: 'boolean', default: false },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Product barcode created successfully' },
          400: { description: 'Validation failed or duplicate barcode' },
          404: { description: 'Company, product, or variant not found' },
        },
      },
    },
    '/product-master/product-barcodes/{id}': {
      get: {
        tags: ['Product Master - Product Barcodes'],
        summary: 'Get single product barcode by ID with full relations',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product barcode retrieved successfully' },
          404: { description: 'Product barcode not found' },
        },
      },
      put: {
        tags: ['Product Master - Product Barcodes'],
        summary: 'Update existing product barcode',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  barcode: { type: 'string' },
                  barcode_type: { type: 'string' },
                  is_primary: { type: 'boolean' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product barcode updated successfully' },
          400: { description: 'Validation failed or barcode already exists' },
          404: { description: 'Barcode not found' },
        },
      },
      delete: {
        tags: ['Product Master - Product Barcodes'],
        summary: 'Delete product barcode',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product barcode deleted successfully' },
          404: { description: 'Product barcode not found' },
        },
      },
    },
    '/product-master/product-barcodes/scan/{companyId}/{barcode}': {
      get: {
        tags: ['Product Master - Product Barcodes'],
        summary: 'POS instant barcode scan lookup',
        parameters: [
          { name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'barcode', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Scanned barcode resolved successfully' },
          404: { description: 'No product or variant found for barcode' },
        },
      },
    },
    '/product-master/product-barcodes/variant/{variantId}': {
      get: {
        tags: ['Product Master - Product Barcodes'],
        summary: 'Get all barcodes for a specific variant',
        parameters: [
          { name: 'variantId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Variant barcodes retrieved successfully' },
          404: { description: 'Variant not found' },
        },
      },
    },
    '/product-master/product-barcodes/{id}/status': {
      patch: {
        tags: ['Product Master - Product Barcodes'],
        summary: 'Toggle or update barcode active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product barcode status updated successfully' },
          404: { description: 'Product barcode not found' },
        },
      },
    },
    '/product-master/product-barcodes/{id}/set-primary': {
      post: {
        tags: ['Product Master - Product Barcodes'],
        summary: 'Designate barcode as primary for its variant',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Primary product barcode set successfully' },
          404: { description: 'Product barcode not found' },
        },
      },
    },
    '/product-master/product-images': {
      get: {
        tags: ['Product Master - Product Images'],
        summary: 'Get paginated list of product images with filters',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'product_id', in: 'query', schema: { type: 'integer' } },
          { name: 'variant_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_primary', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['id', 'display_order', 'product_id', 'variant_id', 'is_primary', 'is_active', 'created_at'],
              default: 'id',
            },
          },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
        ],
        responses: {
          200: { description: 'Product images retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Product Images'],
        summary: 'Upload and create a new product image (saved in uploads/products/product-{productId}/)',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['company_id', 'product_id'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  product_id: { type: 'integer', example: 1 },
                  variant_id: { type: 'integer', nullable: true, example: 1 },
                  image: { type: 'string', format: 'binary', description: 'Image file to upload' },
                  image_url: { type: 'string', description: 'Direct image URL fallback if not uploading file' },
                  alt_text: { type: 'string', example: 'Silk Anarkali Front View' },
                  display_order: { type: 'integer', default: 0 },
                  is_primary: { type: 'boolean', default: false },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Product image created successfully' },
          400: { description: 'Validation failed or missing image' },
          404: { description: 'Company, product, or variant not found' },
        },
      },
    },
    '/product-master/product-images/{id}': {
      get: {
        tags: ['Product Master - Product Images'],
        summary: 'Get single product image by ID with full relations',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product image retrieved successfully' },
          404: { description: 'Product image not found' },
        },
      },
      put: {
        tags: ['Product Master - Product Images'],
        summary: 'Update product image metadata',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  alt_text: { type: 'string' },
                  display_order: { type: 'integer' },
                  is_primary: { type: 'boolean' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product image updated successfully' },
          404: { description: 'Product image not found' },
        },
      },
      delete: {
        tags: ['Product Master - Product Images'],
        summary: 'Delete product image and physically remove the file from product subfolder',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product image and physical file deleted successfully' },
          404: { description: 'Product image not found' },
        },
      },
    },
    '/product-master/product-images/product/{productId}': {
      get: {
        tags: ['Product Master - Product Images'],
        summary: 'Get all images for a specific product',
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'variant_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_primary', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Product images retrieved successfully' },
          404: { description: 'Product not found' },
        },
      },
    },
    '/product-master/product-images/reorder': {
      post: {
        tags: ['Product Master - Product Images'],
        summary: 'Batch reorder product images display order',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items'],
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['id', 'display_order'],
                      properties: {
                        id: { type: 'integer', example: 1 },
                        display_order: { type: 'integer', example: 0 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product images reordered successfully' },
          400: { description: 'Validation failed' },
        },
      },
    },
    '/product-master/product-images/{id}/status': {
      patch: {
        tags: ['Product Master - Product Images'],
        summary: 'Toggle or update product image active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product image status updated successfully' },
          404: { description: 'Product image not found' },
        },
      },
    },
    '/product-master/product-images/{id}/set-primary': {
      post: {
        tags: ['Product Master - Product Images'],
        summary: 'Designate image as primary for its product or variant',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Primary product image set successfully' },
          404: { description: 'Product image not found' },
        },
      },
    },
    '/product-prices': {
      get: {
        tags: ['Product Master - Product Prices'],
        summary: 'List product prices with pagination and filters',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'sort_by', in: 'query', schema: { type: 'string', enum: ['effective_from', 'selling_price', 'mrp', 'id', 'created_at'] } },
          { name: 'sort_order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'product_id', in: 'query', schema: { type: 'integer' } },
          { name: 'variant_id', in: 'query', schema: { type: 'integer' } },
          { name: 'price_type', in: 'query', schema: { type: 'string', example: 'RETAIL' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Product prices retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Product Prices'],
        summary: 'Create a new product price and record initial audit trail',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'product_id', 'variant_id', 'price_type'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  product_id: { type: 'integer', example: 25 },
                  variant_id: { type: 'integer', example: 50 },
                  price_type: { type: 'string', example: 'RETAIL' },
                  purchase_price: { type: 'number', example: 650.00 },
                  cost_price: { type: 'number', example: 720.50 },
                  mrp: { type: 'number', example: 1999.00 },
                  selling_price: { type: 'number', example: 1499.00 },
                  min_selling_price: { type: 'number', example: 1299.00 },
                  currency_code: { type: 'string', default: 'INR' },
                  effective_from: { type: 'string', format: 'date-time' },
                  effective_to: { type: 'string', format: 'date-time' },
                  is_active: { type: 'boolean', default: true },
                  reason: { type: 'string', example: 'Initial catalog pricing' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Product price created successfully' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/product-prices/current': {
      get: {
        tags: ['Product Master - Product Prices'],
        summary: 'Resolve currently active price for POS or billing checkout',
        parameters: [
          { name: 'variant_id', in: 'query', required: true, schema: { type: 'integer' } },
          { name: 'price_type', in: 'query', schema: { type: 'string', default: 'RETAIL' } },
          { name: 'as_of', in: 'query', schema: { type: 'string', format: 'date-time' } },
        ],
        responses: {
          200: { description: 'Current product price retrieved successfully' },
        },
      },
    },
    '/product-prices/history': {
      get: {
        tags: ['Product Master - Product Prices'],
        summary: 'Query price change audit history log',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'product_id', in: 'query', schema: { type: 'integer' } },
          { name: 'variant_id', in: 'query', schema: { type: 'integer' } },
          { name: 'product_price_id', in: 'query', schema: { type: 'integer' } },
          { name: 'price_type', in: 'query', schema: { type: 'string' } },
          { name: 'date_from', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'date_to', in: 'query', schema: { type: 'string', format: 'date-time' } },
        ],
        responses: {
          200: { description: 'Price history retrieved successfully' },
        },
      },
    },
    '/product-prices/{id}': {
      get: {
        tags: ['Product Master - Product Prices'],
        summary: 'Get product price details by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product price retrieved successfully' },
          404: { description: 'Product price not found' },
        },
      },
      put: {
        tags: ['Product Master - Product Prices'],
        summary: 'Update product price (automatically logs changes into price history)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  selling_price: { type: 'number', example: 1399.00 },
                  min_selling_price: { type: 'number', example: 1199.00 },
                  cost_price: { type: 'number' },
                  purchase_price: { type: 'number' },
                  mrp: { type: 'number' },
                  reason: { type: 'string', example: 'Seasonal discount revision' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product price updated successfully' },
          404: { description: 'Product price not found' },
        },
      },
      delete: {
        tags: ['Product Master - Product Prices'],
        summary: 'Delete product price',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product price deleted successfully' },
          404: { description: 'Product price not found' },
        },
      },
    },
    '/product-prices/{id}/status': {
      patch: {
        tags: ['Product Master - Product Prices'],
        summary: 'Toggle product price active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['is_active'],
                properties: {
                  is_active: { type: 'boolean', example: false },
                  reason: { type: 'string', example: 'End of season' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product price status updated successfully' },
          404: { description: 'Product price not found' },
        },
      },
    },
    '/product-prices/{id}/history': {
      get: {
        tags: ['Product Master - Product Prices'],
        summary: 'Get price change history for a specific price record',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Price history retrieved successfully' },
        },
      },
    },
    '/taxes': {
      get: {
        tags: ['Product Master - Taxes'],
        summary: 'List taxes with pagination and filters',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'tax_type', in: 'query', schema: { type: 'string', example: 'GST' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_inclusive', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Taxes retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Taxes'],
        summary: 'Create a custom tax slab (auto-calculates CGST/SGST/IGST if omitted)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'tax_code', 'tax_name', 'rate'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  tax_code: { type: 'string', example: 'GST_18' },
                  tax_name: { type: 'string', example: 'GST 18%' },
                  tax_type: { type: 'string', example: 'GST' },
                  rate: { type: 'number', example: 18.0 },
                  cgst_rate: { type: 'number', example: 9.0 },
                  sgst_rate: { type: 'number', example: 9.0 },
                  igst_rate: { type: 'number', example: 18.0 },
                  cess_rate: { type: 'number', default: 0 },
                  is_inclusive: { type: 'boolean', default: false },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Tax created successfully' },
          400: { description: 'Validation error or duplicate code/name' },
        },
      },
    },
    '/taxes/seed/{companyId}': {
      post: {
        tags: ['Product Master - Taxes'],
        summary: 'Seed standard Indian GST slabs (0%, 5%, 12%, 18%, 28%) for a company',
        parameters: [{ name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Default GST taxes seeded successfully' },
        },
      },
    },
    '/taxes/calculate': {
      post: {
        tags: ['Product Master - Taxes'],
        summary: 'Calculate tax breakdown for POS or billing checkout',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'number', example: 1000.0 },
                  tax_id: { type: 'integer', example: 1 },
                  rate: { type: 'number', example: 18.0 },
                  is_inter_state: { type: 'boolean', example: false },
                  is_inclusive: { type: 'boolean', example: false },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Tax calculation completed successfully' },
        },
      },
    },
    '/taxes/{id}': {
      get: {
        tags: ['Product Master - Taxes'],
        summary: 'Get tax details by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Tax retrieved successfully' },
          404: { description: 'Tax not found' },
        },
      },
      put: {
        tags: ['Product Master - Taxes'],
        summary: 'Update tax details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  tax_name: { type: 'string', example: 'GST 18% (Standard)' },
                  rate: { type: 'number', example: 18.0 },
                  cgst_rate: { type: 'number', example: 9.0 },
                  sgst_rate: { type: 'number', example: 9.0 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Tax updated successfully' },
          404: { description: 'Tax not found' },
        },
      },
      delete: {
        tags: ['Product Master - Taxes'],
        summary: 'Delete tax record (blocked if tax is assigned to products)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Tax deleted successfully' },
          400: { description: 'Cannot delete tax in use' },
          404: { description: 'Tax not found' },
        },
      },
    },
    '/taxes/{id}/status': {
      patch: {
        tags: ['Product Master - Taxes'],
        summary: 'Toggle tax active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
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
          200: { description: 'Tax status updated successfully' },
          404: { description: 'Tax not found' },
        },
      },
    },
    '/product-taxes': {
      get: {
        tags: ['Product Master - Product Taxes'],
        summary: 'List product tax mappings with pagination and filters',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'product_id', in: 'query', schema: { type: 'integer' } },
          { name: 'variant_id', in: 'query', schema: { type: 'integer' } },
          { name: 'tax_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_primary', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Product taxes retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Product Taxes'],
        summary: 'Create a new product tax mapping',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'product_id', 'tax_id'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  product_id: { type: 'integer', example: 25 },
                  variant_id: { type: 'integer', example: 50 },
                  tax_id: { type: 'integer', example: 3 },
                  is_primary: { type: 'boolean', default: false },
                  effective_from: { type: 'string', format: 'date-time' },
                  effective_to: { type: 'string', format: 'date-time' },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Product tax mapping created successfully' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/product-taxes/resolve': {
      get: {
        tags: ['Product Master - Product Taxes'],
        summary: 'Resolve effective tax for POS checkout (Variant first, fallback to product)',
        parameters: [
          { name: 'company_id', in: 'query', required: true, schema: { type: 'integer' } },
          { name: 'product_id', in: 'query', required: true, schema: { type: 'integer' } },
          { name: 'variant_id', in: 'query', schema: { type: 'integer' } },
          { name: 'as_of', in: 'query', schema: { type: 'string', format: 'date-time' } },
        ],
        responses: {
          200: { description: 'Effective tax resolved successfully' },
        },
      },
    },
    '/product-taxes/bulk-assign': {
      post: {
        tags: ['Product Master - Product Taxes'],
        summary: 'Bulk assign a tax slab across multiple products',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'tax_id', 'product_ids'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  tax_id: { type: 'integer', example: 3 },
                  product_ids: { type: 'array', items: { type: 'integer' }, example: [25, 26, 27] },
                  is_primary: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Taxes assigned to products successfully' },
        },
      },
    },
    '/product-taxes/product/{productId}': {
      get: {
        tags: ['Product Master - Product Taxes'],
        summary: 'Get all taxes assigned to a specific product and its variants',
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product taxes retrieved successfully' },
        },
      },
    },
    '/product-taxes/{id}': {
      get: {
        tags: ['Product Master - Product Taxes'],
        summary: 'Get product tax mapping by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product tax retrieved successfully' },
          404: { description: 'Product tax not found' },
        },
      },
      put: {
        tags: ['Product Master - Product Taxes'],
        summary: 'Update product tax mapping',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  tax_id: { type: 'integer', example: 4 },
                  is_primary: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product tax updated successfully' },
          404: { description: 'Product tax not found' },
        },
      },
      delete: {
        tags: ['Product Master - Product Taxes'],
        summary: 'Delete product tax mapping',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product tax deleted successfully' },
          404: { description: 'Product tax not found' },
        },
      },
    },
    '/product-taxes/{id}/status': {
      patch: {
        tags: ['Product Master - Product Taxes'],
        summary: 'Toggle product tax active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
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
          200: { description: 'Product tax status updated successfully' },
          404: { description: 'Product tax not found' },
        },
      },
    },
    '/product-taxes/{id}/set-primary': {
      post: {
        tags: ['Product Master - Product Taxes'],
        summary: 'Set tax mapping as primary for its variant or product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Primary product tax set successfully' },
          404: { description: 'Product tax not found' },
        },
      },
    },
    '/discounts': {
      get: {
        tags: ['Product Master - Discounts'],
        summary: 'List discounts with filters, search, and pagination',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'discount_type', in: 'query', schema: { type: 'string', enum: ['PERCENTAGE', 'FIXED_AMOUNT'] } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_stackable', in: 'query', schema: { type: 'boolean' } },
          { name: 'as_of', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'sort_by', in: 'query', schema: { type: 'string', default: 'priority' } },
          { name: 'sort_order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: { description: 'Discounts retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Discounts'],
        summary: 'Create a new discount campaign',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'discount_code', 'discount_name', 'discount_type', 'discount_value'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  discount_code: { type: 'string', example: 'FESTIVE25' },
                  discount_name: { type: 'string', example: 'Festive Special 25%' },
                  discount_type: { type: 'string', enum: ['PERCENTAGE', 'FIXED_AMOUNT'], example: 'PERCENTAGE' },
                  discount_value: { type: 'number', example: 25.0 },
                  minimum_quantity: { type: 'number', example: 1 },
                  maximum_discount: { type: 'number', example: 1500.0 },
                  start_at: { type: 'string', format: 'date-time', example: '2026-10-01T00:00:00Z' },
                  end_at: { type: 'string', format: 'date-time', example: '2026-11-15T23:59:59Z' },
                  priority: { type: 'integer', example: 4 },
                  is_stackable: { type: 'boolean', example: false },
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Discount created successfully' },
          400: { description: 'Validation error or duplicate discount code' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/discounts/seed/{companyId}': {
      post: {
        tags: ['Product Master - Discounts'],
        summary: 'Seed standard retail apparel promotional discounts for a company',
        parameters: [{ name: 'companyId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Standard promotional discounts seeded successfully' },
          404: { description: 'Company not found' },
        },
      },
    },
    '/discounts/calculate': {
      post: {
        tags: ['Product Master - Discounts'],
        summary: 'Real-time POS checkout discount and savings calculator',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'number', example: 2500.0 },
                  quantity: { type: 'number', default: 1, example: 2 },
                  discount_id: { type: 'integer', example: 1 },
                  discount_type: { type: 'string', enum: ['PERCENTAGE', 'FIXED_AMOUNT'] },
                  discount_value: { type: 'number', example: 20.0 },
                  minimum_quantity: { type: 'number', example: 1 },
                  maximum_discount: { type: 'number', example: 1000.0 },
                  as_of: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Discount calculated successfully' },
          400: { description: 'Validation error' },
          404: { description: 'Discount not found' },
        },
      },
    },
    '/discounts/{id}': {
      get: {
        tags: ['Product Master - Discounts'],
        summary: 'Get single discount by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Discount retrieved successfully' },
          404: { description: 'Discount not found' },
        },
      },
      put: {
        tags: ['Product Master - Discounts'],
        summary: 'Update discount details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  discount_code: { type: 'string', example: 'FESTIVE30' },
                  discount_name: { type: 'string', example: 'Festive Special 30% Off' },
                  discount_type: { type: 'string', enum: ['PERCENTAGE', 'FIXED_AMOUNT'] },
                  discount_value: { type: 'number', example: 30.0 },
                  minimum_quantity: { type: 'number', example: 2 },
                  maximum_discount: { type: 'number', example: 2000.0 },
                  start_at: { type: 'string', format: 'date-time' },
                  end_at: { type: 'string', format: 'date-time' },
                  priority: { type: 'integer', example: 5 },
                  is_stackable: { type: 'boolean' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Discount updated successfully' },
          400: { description: 'Validation error or duplicate code' },
          404: { description: 'Discount not found' },
        },
      },
      delete: {
        tags: ['Product Master - Discounts'],
        summary: 'Delete discount (fails if in use by product discounts)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Discount deleted successfully' },
          400: { description: 'Cannot delete discount as it is associated with products' },
          404: { description: 'Discount not found' },
        },
      },
    },
    '/discounts/{id}/status': {
      patch: {
        tags: ['Product Master - Discounts'],
        summary: 'Toggle discount active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
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
          200: { description: 'Discount status updated successfully' },
          404: { description: 'Discount not found' },
        },
      },
    },
    '/product-discounts': {
      get: {
        tags: ['Product Master - Product Discounts'],
        summary: 'List product discount mappings with pagination and filters',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'company_id', in: 'query', schema: { type: 'integer' } },
          { name: 'product_id', in: 'query', schema: { type: 'integer' } },
          { name: 'variant_id', in: 'query', schema: { type: 'integer' } },
          { name: 'discount_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_primary', in: 'query', schema: { type: 'boolean' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'sort_by', in: 'query', schema: { type: 'string', default: 'id' } },
          { name: 'sort_order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: { description: 'Product discounts retrieved successfully' },
        },
      },
      post: {
        tags: ['Product Master - Product Discounts'],
        summary: 'Create a new product discount mapping',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'product_id', 'discount_id'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  product_id: { type: 'integer', example: 25 },
                  variant_id: { type: 'integer', example: 50 },
                  discount_id: { type: 'integer', example: 3 },
                  is_primary: { type: 'boolean', default: false },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Product discount mapping created successfully' },
          400: { description: 'Validation error or duplicate mapping' },
        },
      },
    },
    '/product-discounts/resolve': {
      get: {
        tags: ['Product Master - Product Discounts'],
        summary: 'Resolve effective discount for checkout (Variant first, fallback to product)',
        parameters: [
          { name: 'company_id', in: 'query', required: true, schema: { type: 'integer' } },
          { name: 'product_id', in: 'query', required: true, schema: { type: 'integer' } },
          { name: 'variant_id', in: 'query', schema: { type: 'integer' } },
          { name: 'amount', in: 'query', schema: { type: 'number', example: 2000.0 } },
          { name: 'quantity', in: 'query', schema: { type: 'number', default: 1, example: 2 } },
          { name: 'as_of', in: 'query', schema: { type: 'string', format: 'date-time' } },
        ],
        responses: {
          200: { description: 'Effective discount resolved successfully' },
        },
      },
    },
    '/product-discounts/bulk-assign': {
      post: {
        tags: ['Product Master - Product Discounts'],
        summary: 'Bulk assign a discount campaign across multiple products',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'discount_id', 'product_ids'],
                properties: {
                  company_id: { type: 'integer', example: 1 },
                  discount_id: { type: 'integer', example: 4 },
                  product_ids: { type: 'array', items: { type: 'integer' }, example: [25, 26, 27] },
                  is_primary: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Discounts assigned to products successfully' },
        },
      },
    },
    '/product-discounts/product/{productId}': {
      get: {
        tags: ['Product Master - Product Discounts'],
        summary: 'Get all discounts assigned to a specific product and its variants',
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product discounts retrieved successfully' },
        },
      },
    },
    '/product-discounts/{id}': {
      get: {
        tags: ['Product Master - Product Discounts'],
        summary: 'Get product discount mapping by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product discount retrieved successfully' },
          404: { description: 'Product discount not found' },
        },
      },
      put: {
        tags: ['Product Master - Product Discounts'],
        summary: 'Update product discount mapping',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  discount_id: { type: 'integer', example: 5 },
                  is_primary: { type: 'boolean', example: true },
                  is_active: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Product discount updated successfully' },
          404: { description: 'Product discount not found' },
        },
      },
      delete: {
        tags: ['Product Master - Product Discounts'],
        summary: 'Delete product discount mapping',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Product discount deleted successfully' },
          404: { description: 'Product discount not found' },
        },
      },
    },
    '/product-discounts/{id}/status': {
      patch: {
        tags: ['Product Master - Product Discounts'],
        summary: 'Toggle product discount active status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
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
          200: { description: 'Product discount status updated successfully' },
          404: { description: 'Product discount not found' },
        },
      },
    },
    '/product-discounts/{id}/set-primary': {
      post: {
        tags: ['Product Master - Product Discounts'],
        summary: 'Set discount mapping as primary for its variant or product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Primary product discount set successfully' },
          404: { description: 'Product discount not found' },
        },
      },
    },
  },
};

export default swaggerSpec;
