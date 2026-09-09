import { Router } from 'express';
import branchRoutes from './branches/branch.routes.js';
import branchAddressRoutes from './branchAddresses/branchAddress.routes.js';
import branchContactRoutes from './branchContacts/branchContact.routes.js';

const router = Router();

router.use('/branches', branchRoutes);
router.use('/branch-addresses', branchAddressRoutes);
router.use('/branch-contacts', branchContactRoutes);

export { branchRoutes, branchAddressRoutes, branchContactRoutes };
export default router;
