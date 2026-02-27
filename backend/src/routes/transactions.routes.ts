import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTransactionSchema, updateTransactionSchema } from '../schemas/transaction.schema';
import * as ctrl from '../controllers/transactions.controller';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.post('/', validate(createTransactionSchema), ctrl.create);
router.get('/:id', ctrl.get);
router.put('/:id', validate(updateTransactionSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
