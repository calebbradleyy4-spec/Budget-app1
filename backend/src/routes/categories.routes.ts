import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema';
import * as ctrl from '../controllers/categories.controller';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.post('/', validate(createCategorySchema), ctrl.create);
router.put('/:id', validate(updateCategorySchema), ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
