import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/reports.controller';

const router = Router();
router.use(authenticate);

router.get('/spending-by-category', ctrl.spendingByCategory);
router.get('/monthly-trend', ctrl.monthlyTrend);
router.get('/summary', ctrl.summary);

export default router;
