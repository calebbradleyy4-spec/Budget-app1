import { z } from 'zod';

export const createRecurringSchema = z.object({
  category_id: z.number().int().positive(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  description: z.string().max(500).default(''),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
});

export const updateRecurringSchema = createRecurringSchema
  .partial()
  .extend({ is_active: z.boolean().optional() });

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;
export type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>;
