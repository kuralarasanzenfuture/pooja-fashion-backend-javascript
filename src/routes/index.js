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

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Pooja Fashion backend is running',
  });
});

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

export default router;
