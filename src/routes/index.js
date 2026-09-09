import { Router } from 'express';
import companyRoutes from '../modules/companies/company.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Pooja Fashion backend is running',
  });
});

router.use('/companies', companyRoutes);

export default router;
