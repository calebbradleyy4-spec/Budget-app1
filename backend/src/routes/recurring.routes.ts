import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createRecurringSchema, updateRecurringSchema } from '../schemas/recurring.schema';
import * as ctrl from '../controllers/recurring.controller';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.post('/', validate(createRecurringSchema), ctrl.create);
router.get('/:id', ctrl.get);
router.put('/:id', validate(updateRecurringSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
