import { Router } from 'express';
import bankRoutes from './banks/bank.routes.js';
import bankIdentifierRoutes from './bankIdentifiers/bankIdentifier.routes.js';
import companyBankRoutes from './companyBanks/companyBank.routes.js';

const router = Router();

router.use('/banks', bankRoutes);
router.use('/bank-identifiers', bankIdentifierRoutes);
router.use('/company-banks', companyBankRoutes);

export { bankRoutes, bankIdentifierRoutes, companyBankRoutes };
export default router;
