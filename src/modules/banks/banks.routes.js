import { Router } from 'express';
import bankRoutes from './banks/bank.routes.js';
import bankIdentifierRoutes from './bankIdentifiers/bankIdentifier.routes.js';
import companyBankRoutes from './companyBanks/companyBank.routes.js';

const router = Router();

// 1. Bank Master routes (default base & aliases)
router.use('/banks', bankRoutes);
router.use('/master', bankRoutes);

// 2. Bank Identifiers routes
router.use('/bank-identifiers', bankIdentifierRoutes);
router.use('/identifiers', bankIdentifierRoutes);

// 3. Company Bank Accounts routes
router.use('/company-banks', companyBankRoutes);
router.use('/company-accounts', companyBankRoutes);

// Direct root fallback to bank master
router.use('/', bankRoutes);

export { bankRoutes, bankIdentifierRoutes, companyBankRoutes };
export default router;
