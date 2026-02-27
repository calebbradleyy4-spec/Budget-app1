import { Router } from 'express';
import authRoutes from './auth.routes';
import categoriesRoutes from './categories.routes';
import transactionsRoutes from './transactions.routes';
import budgetsRoutes from './budgets.routes';
import reportsRoutes from './reports.routes';
import recurringRoutes from './recurring.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoriesRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/budgets', budgetsRoutes);
router.use('/reports', reportsRoutes);
router.use('/recurring', recurringRoutes);

export default router;
