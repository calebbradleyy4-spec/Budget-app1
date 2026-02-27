import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBudgetSchema, updateBudgetSchema } from '../schemas/budget.schema';
import * as ctrl from '../controllers/budgets.controller';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.post('/', validate(createBudgetSchema), ctrl.create);
router.put('/:id', validate(updateBudgetSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
