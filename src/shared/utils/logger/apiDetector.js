/**
 * Centralized API Debugging & Logging System
 * API Detector
 *
 * Automatically associates incoming HTTP requests with:
 * - Module
 * - Category
 * - Subcategory
 * - Controller
 * - Service
 * - Operation / Database action
 *
 * Honors explicit route metadata (req.apiContext) when present, and dynamically
 * infers metadata across all existing and future backend endpoints.
 */

const MODULE_DEFINITIONS = [
  {
    prefix: '/api/categories',
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    service: 'CategoryService',
    controllerBase: 'categoryController',
  },
  {
    prefix: '/api/product-master/categories',
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    service: 'CategoryService',
    controllerBase: 'categoryController',
  },
  {
    prefix: '/api/subcategories',
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    service: 'SubCategoryService',
    controllerBase: 'subCategoryController',
  },
  {
    prefix: '/api/sub-categories',
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    service: 'SubCategoryService',
    controllerBase: 'subCategoryController',
  },
  {
    prefix: '/api/product-master/subcategories',
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    service: 'SubCategoryService',
    controllerBase: 'subCategoryController',
  },
  {
    prefix: '/api/product-master/sub-categories',
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    service: 'SubCategoryService',
    controllerBase: 'subCategoryController',
  },
  {
    prefix: '/api/auth',
    module: 'AUTH',
    category: 'AUTHENTICATION',
    service: 'AuthService',
    controllerBase: 'authController',
  },
  {
    prefix: '/api/users',
    module: 'USER',
    category: 'USER MANAGEMENT',
    service: 'UserService',
    controllerBase: 'userController',
  },
  {
    prefix: '/api/roles',
    module: 'ROLE',
    category: 'ROLE & PERMISSION MANAGEMENT',
    service: 'RoleService',
    controllerBase: 'roleController',
  },
  {
    prefix: '/api/companies',
    module: 'COMPANY',
    category: 'COMPANY MANAGEMENT',
    service: 'CompanyService',
    controllerBase: 'companyController',
  },
  {
    prefix: '/api/company-addresses',
    module: 'COMPANY_ADDRESS',
    category: 'COMPANY MANAGEMENT',
    service: 'CompanyAddressService',
    controllerBase: 'companyAddressController',
  },
  {
    prefix: '/api/company-contacts',
    module: 'COMPANY_CONTACT',
    category: 'COMPANY MANAGEMENT',
    service: 'CompanyContactService',
    controllerBase: 'companyContactController',
  },
  {
    prefix: '/api/company-tax-details',
    module: 'COMPANY_TAX',
    category: 'COMPANY MANAGEMENT',
    service: 'CompanyTaxService',
    controllerBase: 'companyTaxController',
  },
  {
    prefix: '/api/branches',
    module: 'BRANCH',
    category: 'BRANCH MANAGEMENT',
    service: 'BranchService',
    controllerBase: 'branchController',
  },
  {
    prefix: '/api/branch-addresses',
    module: 'BRANCH_ADDRESS',
    category: 'BRANCH MANAGEMENT',
    service: 'BranchAddressService',
    controllerBase: 'branchAddressController',
  },
  {
    prefix: '/api/branch-contacts',
    module: 'BRANCH_CONTACT',
    category: 'BRANCH MANAGEMENT',
    service: 'BranchContactService',
    controllerBase: 'branchContactController',
  },
  {
    prefix: '/api/employees',
    module: 'EMPLOYEE',
    category: 'EMPLOYEE MANAGEMENT',
    service: 'EmployeeService',
    controllerBase: 'employeeController',
  },
  {
    prefix: '/api/products',
    module: 'PRODUCT',
    category: 'PRODUCT CATALOG',
    service: 'ProductService',
    controllerBase: 'productController',
  },
  {
    prefix: '/api/product-variants',
    module: 'PRODUCT_VARIANT',
    category: 'PRODUCT CATALOG',
    service: 'ProductVariantService',
    controllerBase: 'productVariantController',
  },
  {
    prefix: '/api/product-barcodes',
    module: 'PRODUCT_BARCODE',
    category: 'PRODUCT CATALOG',
    service: 'ProductBarcodeService',
    controllerBase: 'productBarcodeController',
  },
  {
    prefix: '/api/product-images',
    module: 'PRODUCT_IMAGE',
    category: 'PRODUCT CATALOG',
    service: 'ProductImageService',
    controllerBase: 'productImageController',
  },
  {
    prefix: '/api/brands',
    module: 'BRAND',
    category: 'PRODUCT MASTER',
    service: 'BrandService',
    controllerBase: 'brandController',
  },
  {
    prefix: '/api/size-groups',
    module: 'SIZE_GROUP',
    category: 'PRODUCT MASTER',
    service: 'SizeGroupService',
    controllerBase: 'sizeGroupController',
  },
  {
    prefix: '/api/sizes',
    module: 'SIZE',
    category: 'PRODUCT MASTER',
    service: 'SizeService',
    controllerBase: 'sizeController',
  },
  {
    prefix: '/api/colors',
    module: 'COLOR',
    category: 'PRODUCT MASTER',
    service: 'ColorService',
    controllerBase: 'colorController',
  },
  {
    prefix: '/api/materials',
    module: 'MATERIAL',
    category: 'PRODUCT MASTER',
    service: 'MaterialService',
    controllerBase: 'materialController',
  },
  {
    prefix: '/api/units',
    module: 'UNIT',
    category: 'PRODUCT MASTER',
    service: 'UnitService',
    controllerBase: 'unitController',
  },
  {
    prefix: '/api/product-types',
    module: 'PRODUCT_TYPE',
    category: 'PRODUCT MASTER',
    service: 'ProductTypeService',
    controllerBase: 'productTypeController',
  },
  {
    prefix: '/api/taxes',
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    service: 'TaxService',
    controllerBase: 'taxController',
  },
  {
    prefix: '/api/product-taxes',
    module: 'PRODUCT_TAX',
    category: 'TAX MANAGEMENT',
    service: 'ProductTaxService',
    controllerBase: 'productTaxController',
  },
  {
    prefix: '/api/discounts',
    module: 'DISCOUNT',
    category: 'PRICING & DISCOUNTS',
    service: 'DiscountService',
    controllerBase: 'discountController',
  },
  {
    prefix: '/api/banks',
    module: 'BANK',
    category: 'BANK MANAGEMENT',
    service: 'BankService',
    controllerBase: 'bankController',
  },
  {
    prefix: '/api/bank-identifiers',
    module: 'BANK_IDENTIFIER',
    category: 'BANK MANAGEMENT',
    service: 'BankIdentifierService',
    controllerBase: 'bankIdentifierController',
  },
  {
    prefix: '/api/company-banks',
    module: 'COMPANY_BANK',
    category: 'BANK MANAGEMENT',
    service: 'CompanyBankService',
    controllerBase: 'companyBankController',
  },
  {
    prefix: '/api/audit-logs',
    module: 'AUDIT_LOG',
    category: 'AUDIT MANAGEMENT',
    service: 'AuditLogService',
    controllerBase: 'auditLogController',
  },
  {
    prefix: '/health',
    module: 'SYSTEM',
    category: 'SYSTEM HEALTH',
    service: 'HealthService',
    controllerBase: 'healthController',
  },
  {
    prefix: '/api/health',
    module: 'SYSTEM',
    category: 'SYSTEM HEALTH',
    service: 'HealthService',
    controllerBase: 'healthController',
  },
];

/**
 * Clean path by removing query strings and trailing slashes
 */
const cleanPath = (url = '/') => {
  return (url || '/').split('?')[0].replace(/\/+$/, '') || '/';
};

/**
 * Detect or merge API context from HTTP request
 * @param {import('express').Request} req
 * @returns {Object} Complete API metadata context
 */
export const detectApiContext = (req) => {
  const explicit = req.apiContext || {};
  const method = (req.method || 'GET').toUpperCase();
  const url = req.originalUrl || req.url || '/';
  const path = cleanPath(url);

  // 1. Identify matched module definition
  let matchedDef = MODULE_DEFINITIONS.find((def) => path.startsWith(def.prefix));

  if (!matchedDef) {
    // Dynamic fallback for any unmatched module
    const segments = path.replace(/^\/api\//, '').split('/');
    const rootSegment = segments[0] || 'GENERAL';
    const formatted = rootSegment.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();

    matchedDef = {
      prefix: `/api/${rootSegment}`,
      module: formatted,
      category: `${formatted} MANAGEMENT`,
      service: `${formatted.charAt(0) + formatted.slice(1).toLowerCase()}Service`,
      controllerBase: `${formatted.toLowerCase()}Controller`,
    };
  }

  const moduleName = explicit.module || matchedDef.module;
  const categoryName = explicit.category || matchedDef.category;

  // 2. Derive Subcategory / Action if not explicitly specified
  let subcategory = explicit.subcategory;
  let controller = explicit.controller;
  let service = explicit.service || matchedDef.service;
  let operation = explicit.operation;
  let database = explicit.database;

  const targetId = req.params?.id || req.params?.companyId || null;
  const isImageEndpoint = path.endsWith('/image');
  const isStatusEndpoint = path.endsWith('/status');
  const isReorderEndpoint = path.endsWith('/reorder');
  const isAllEndpoint = path.endsWith('/all');
  const isTreeEndpoint = path.endsWith('/tree');
  const isStatsEndpoint = path.endsWith('/stats');
  const isCheckName = path.endsWith('/check-name');
  const isCheckCode = path.endsWith('/check-code');
  const isSubcategories = path.endsWith('/subcategories');

  if (!subcategory) {
    switch (method) {
      case 'GET':
        if (isAllEndpoint) {
          subcategory = `GET ALL ${moduleName}S (UNPAGINATED)`;
          operation = `Fetch all ${moduleName.toLowerCase()}s unpaginated`;
          controller = `${matchedDef.controllerBase}.getAllUnpaginated`;
        } else if (isTreeEndpoint) {
          subcategory = `GET ${moduleName} TREE`;
          operation = `Fetch ${moduleName.toLowerCase()} hierarchy tree`;
          controller = `${matchedDef.controllerBase}.getTree`;
        } else if (isStatsEndpoint) {
          subcategory = `GET ${moduleName} STATS`;
          operation = `Fetch ${moduleName.toLowerCase()} statistics`;
          controller = `${matchedDef.controllerBase}.getStats`;
        } else if (isCheckName) {
          subcategory = `CHECK ${moduleName} NAME`;
          operation = `Check if ${moduleName.toLowerCase()} name exists`;
          controller = `${matchedDef.controllerBase}.checkName`;
        } else if (isCheckCode) {
          subcategory = `CHECK ${moduleName} CODE`;
          operation = `Check if ${moduleName.toLowerCase()} code exists`;
          controller = `${matchedDef.controllerBase}.checkCode`;
        } else if (isSubcategories) {
          subcategory = `GET ${moduleName} SUBCATEGORIES`;
          operation = `Fetch subcategories under ${moduleName.toLowerCase()} ID ${targetId || ''}`;
          controller = `${matchedDef.controllerBase}.getSubcategories`;
        } else if (targetId || /\/\d+$/.test(path)) {
          subcategory = `GET ${moduleName} BY ID`;
          operation = `Fetch ${moduleName.toLowerCase()} ID ${targetId || ''}`;
          controller = `${matchedDef.controllerBase}.getById`;
        } else {
          subcategory = `GET ALL ${moduleName}S`;
          operation = `Fetch ${moduleName.toLowerCase()}s with pagination`;
          controller = `${matchedDef.controllerBase}.getAll`;
        }
        break;

      case 'POST':
        if (isImageEndpoint) {
          subcategory = `UPLOAD ${moduleName} IMAGE`;
          operation = `Upload image for ${moduleName.toLowerCase()} ID ${targetId || ''}`;
          controller = `${matchedDef.controllerBase}.uploadImage`;
          database = `UPDATE ${moduleName.toLowerCase()} (image)`;
        } else if (path.includes('/login')) {
          subcategory = 'LOGIN';
          operation = 'Authenticate user and generate JWT token';
          controller = 'authController.login';
        } else if (path.includes('/register')) {
          subcategory = 'REGISTER';
          operation = 'Register new user account';
          controller = 'authController.register';
        } else if (path.includes('/logout')) {
          subcategory = 'LOGOUT';
          operation = 'Revoke refresh token and logout';
          controller = 'authController.logout';
        } else if (path.includes('/refresh')) {
          subcategory = 'REFRESH TOKEN';
          operation = 'Refresh access token';
          controller = 'authController.refreshToken';
        } else {
          subcategory = `CREATE ${moduleName}`;
          operation = `Create new ${moduleName.toLowerCase()}`;
          controller = `${matchedDef.controllerBase}.create`;
          database = `INSERT ${moduleName.toLowerCase()}`;
        }
        break;

      case 'PUT':
        subcategory = `UPDATE ${moduleName}`;
        operation = `UPDATE ${moduleName.toLowerCase()} ID ${targetId || ''}`;
        controller = `${matchedDef.controllerBase}.update`;
        database = `UPDATE ${moduleName.toLowerCase()}`;
        break;

      case 'PATCH':
        if (isStatusEndpoint) {
          subcategory = `UPDATE ${moduleName} STATUS`;
          operation = `UPDATE STATUS ${moduleName.toLowerCase()} ID ${targetId || ''}`;
          controller = `${matchedDef.controllerBase}.updateStatus`;
          database = `UPDATE ${moduleName.toLowerCase()} (is_active)`;
        } else if (isReorderEndpoint) {
          subcategory = `REORDER ${moduleName}S`;
          operation = `Bulk reorder ${moduleName.toLowerCase()} display sequence`;
          controller = `${matchedDef.controllerBase}.reorder`;
          database = `UPDATE ${moduleName.toLowerCase()} (display_order)`;
        } else {
          subcategory = `PARTIAL UPDATE ${moduleName}`;
          operation = `UPDATE ${moduleName.toLowerCase()} ID ${targetId || ''}`;
          controller = `${matchedDef.controllerBase}.update`;
          database = `UPDATE ${moduleName.toLowerCase()}`;
        }
        break;

      case 'DELETE':
        if (isImageEndpoint) {
          subcategory = `DELETE ${moduleName} IMAGE`;
          operation = `DELETE image for ${moduleName.toLowerCase()} ID ${targetId || ''}`;
          controller = `${matchedDef.controllerBase}.deleteImage`;
          database = `UPDATE ${moduleName.toLowerCase()} (clear image)`;
        } else {
          subcategory = `DELETE ${moduleName}`;
          operation = `DELETE ${moduleName.toLowerCase()} ID ${targetId || ''}`;
          controller = `${matchedDef.controllerBase}.delete`;
          database = `DELETE FROM ${moduleName.toLowerCase()}`;
        }
        break;

      default:
        subcategory = `${method} ${moduleName}`;
        operation = `Process ${method} on ${path}`;
        controller = `${matchedDef.controllerBase}.${method.toLowerCase()}`;
        break;
    }
  }

  return {
    module: moduleName,
    category: categoryName,
    subcategory,
    controller: controller || explicit.controller || `${matchedDef.controllerBase}.${method.toLowerCase()}`,
    service,
    operation: operation || explicit.operation,
    database: database || explicit.database,
  };
};

export default {
  MODULE_DEFINITIONS,
  detectApiContext,
};

