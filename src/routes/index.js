import { Router } from 'express';
import companyRoutes from '../modules/companies/company.routes.js';
import companyAddressRoutes from '../modules/companyAddresses/companyAddress.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Pooja Fashion backend is running',
  });
});

router.use('/companies', companyRoutes);
router.use('/company-addresses', companyAddressRoutes);

export default router;
