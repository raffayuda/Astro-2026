import { z } from 'zod';

/**
 * SumoPod webhook body — see .env.example for the signing secret / token.
 * The `payment.test` event sent by the dashboard's "Send Test" button doesn't
 * carry a full `data` payload, so only `event_type` is strictly required;
 * `order_id` is checked separately for the events we actually act on.
 */
export const sumoPodWebhookSchema = z.object({
  event_type: z.enum(['payment.completed', 'payment.failed', 'payment.expired', 'payment.test']),
  data: z
    .object({
      payment_id: z.string().optional(),
      order_id: z.string().optional(),
      amount: z.number().optional(),
      fee: z.number().optional(),
      net_amount: z.number().optional(),
      status: z.string().optional(),
      payment_method: z.string().nullable().optional(),
      completed_at: z.string().nullable().optional(),
    })
    .optional()
    .default({}),
});

export type SumoPodWebhookBody = z.infer<typeof sumoPodWebhookSchema>;

/** Map a SumoPod webhook event to this app's `registrations.paymentStatus`. */
export const EVENT_TO_STATUS: Record<string, string> = {
  'payment.completed': 'paid',
  'payment.failed': 'failed',
  'payment.expired': 'expired',
};
