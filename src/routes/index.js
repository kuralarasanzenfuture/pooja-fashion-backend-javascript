import { Router } from 'express';
import companyRoutes from '../modules/companies/company.routes.js';
import companyAddressRoutes from '../modules/companyAddresses/companyAddress.routes.js';
import companyContactRoutes from '../modules/companyContacts/companyContact.routes.js';
import companyTaxDetailRoutes from '../modules/companyTaxDetails/companyTaxDetail.routes.js';
import bankRoutes from '../modules/banks/banks/bank.routes.js';
import bankIdentifierRoutes from '../modules/banks/bankIdentifiers/bankIdentifier.routes.js';
import companyBankRoutes from '../modules/banks/companyBanks/companyBank.routes.js';
import branchRoutes from '../modules/branches/branches/branch.routes.js';
import branchAddressRoutes from '../modules/branches/branchAddresses/branchAddress.routes.js';
import branchContactRoutes from '../modules/branches/branchContacts/branchContact.routes.js';
import roleRoutes from '../modules/roles/role.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import employeeRoutes from '../modules/employees/employee.routes.js';
import productMasterRoutes from '../modules/product-master/productMaster.routes.js';
import brandRoutes from '../modules/product-master/brands/brand.routes.js';
import sizeGroupRoutes from '../modules/product-master/sizeGroups/sizeGroup.routes.js';
import sizeRoutes from '../modules/product-master/sizes/size.routes.js';
import colorRoutes from '../modules/product-master/colors/color.routes.js';
import materialRoutes from '../modules/product-master/materials/material.routes.js';
import unitRoutes from '../modules/product-master/units/unit.routes.js';
import productTypeRoutes from '../modules/product-master/productTypes/productType.routes.js';
import productRoutes from '../modules/product-master/products/product.routes.js';
import productVariantRoutes from '../modules/product-master/productVariants/productVariant.routes.js';
import productBarcodeRoutes from '../modules/product-master/productBarcodes/productBarcode.routes.js';
import productImageRoutes from '../modules/product-master/productImages/productImage.routes.js';
import productPriceRoutes from '../modules/product-master/productPrices/productPrice.routes.js';
import taxRoutes from '../modules/product-master/taxes/tax.routes.js';
import productTaxRoutes from '../modules/product-master/productTaxes/productTax.routes.js';
import discountRoutes from '../modules/product-master/discounts/discount.routes.js';
import productDiscountRoutes from '../modules/product-master/productDiscounts/productDiscount.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Pooja Fashion backend is running',
  });
});

router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/company-addresses', companyAddressRoutes);
router.use('/company-contacts', companyContactRoutes);
router.use('/company-tax-details', companyTaxDetailRoutes);
router.use('/banks', bankRoutes);
router.use('/bank-identifiers', bankIdentifierRoutes);
router.use('/company-banks', companyBankRoutes);
router.use('/branches', branchRoutes);
router.use('/branch-addresses', branchAddressRoutes);
router.use('/branch-contacts', branchContactRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/employees', employeeRoutes);
router.use('/brands', brandRoutes);
router.use('/size-groups', sizeGroupRoutes);
router.use('/sizes', sizeRoutes);
router.use('/colors', colorRoutes);
router.use('/materials', materialRoutes);
router.use('/units', unitRoutes);
router.use('/product-types', productTypeRoutes);
router.use('/products', productRoutes);
router.use('/product-variants', productVariantRoutes);
router.use('/product-barcodes', productBarcodeRoutes);
router.use('/product-images', productImageRoutes);
router.use('/product-prices', productPriceRoutes);
router.use('/taxes', taxRoutes);
router.use('/product-taxes', productTaxRoutes);
router.use('/discounts', discountRoutes);
router.use('/product-discounts', productDiscountRoutes);
router.use('/product-master', productMasterRoutes);

export default router;
