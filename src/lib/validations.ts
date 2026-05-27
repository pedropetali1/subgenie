import { z } from 'zod';

export const subscriptionSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  price: z
    .number({ invalid_type_error: 'Valor inválido' })
    .positive('Valor deve ser positivo')
    .max(99999, 'Valor muito alto'),
  cycle: z.enum(['weekly', 'monthly', 'quarterly', 'semiannual', 'annual'], {
    errorMap: () => ({ message: 'Ciclo inválido' }),
  }),
  category: z.enum(
    [
      'streaming',
      'music',
      'gaming',
      'fitness',
      'cloud',
      'food',
      'news',
      'education',
      'productivity',
      'finance',
      'other',
    ],
    { errorMap: () => ({ message: 'Categoria inválida' }) },
  ),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use AAAA-MM-DD)'),
  notes: z.string().max(500, 'Notas muito longas').nullable().optional(),
  cancel_url: z
    .string()
    .url('URL inválida')
    .nullable()
    .optional()
    .or(z.literal('')),
  is_active: z.boolean().optional().default(true),
  shared_count: z
    .number()
    .int()
    .min(1, 'Mínimo 1 pessoa')
    .max(20, 'Máximo 20 pessoas')
    .optional()
    .default(1),
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().max(100).nullable().optional(),
  notification_days_before: z.number().int().min(1).max(7).optional(),
  notification_email: z.boolean().optional(),
  notification_push: z.boolean().optional(),
  locale: z.enum(['pt-BR', 'en']).optional(),
  theme: z.enum(['dark', 'light', 'system']).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
