import { Router } from 'express';
import companyRoutes from '../modules/companies/company.routes.js';
import companyAddressRoutes from '../modules/companyAddresses/companyAddress.routes.js';
import companyContactRoutes from '../modules/companyContacts/companyContact.routes.js';
import companyTaxDetailRoutes from '../modules/companyTaxDetails/companyTaxDetail.routes.js';

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

export default router;
