import { Elysia, status } from 'elysia';
import { sumoPodWebhookSchema, EVENT_TO_STATUS } from './model';
import { verifyWebhookSignature, verifyWebhookToken } from './sumopod';
import { setPaymentStatusByReference } from '@/src/server/modules/registrations/service';

const WEBHOOK_SECRET = process.env.SUMOPOD_WEBHOOK_SECRET; // whsec_...
const WEBHOOK_TOKEN = process.env.SUMOPOD_WEBHOOK_TOKEN; // whtok_...

/**
 * SumoPod webhook receiver. Reads the raw body itself (no `body` schema) so
 * the exact bytes are available for Svix signature verification — a
 * reformatted/re-parsed body would break the HMAC comparison.
 */
export const paymentsModule = new Elysia({ prefix: '/payments' }).post(
  '/webhook',
  async ({ request }) => {
    const rawBody = await request.text();

    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');
    const webhookToken = request.headers.get('x-webhook-token');

    let verified = false;
    if (WEBHOOK_SECRET && svixId && svixTimestamp && svixSignature) {
      verified = verifyWebhookSignature(
        WEBHOOK_SECRET,
        svixId,
        svixTimestamp,
        svixSignature,
        rawBody,
      );
    } else if (WEBHOOK_TOKEN) {
      verified = verifyWebhookToken(WEBHOOK_TOKEN, webhookToken);
    }

    // Fail closed: an unconfigured or failed check never applies a status change.
    if (!verified) return status(401, { error: 'Invalid webhook signature' });

    let json: unknown;
    try {
      json = JSON.parse(rawBody);
    } catch {
      return status(400, { error: 'Invalid JSON' });
    }

    const parsed = sumoPodWebhookSchema.safeParse(json);
    if (!parsed.success) return status(400, { error: 'Invalid payload' });

    const { event_type, data } = parsed.data;
    if (event_type === 'payment.test') return { status: 'ok' };

    const newStatus = EVENT_TO_STATUS[event_type];
    if (!newStatus) return { status: 'ignored' };

    if (!data.order_id) {
      console.warn(`SumoPod webhook: ${event_type} event missing data.order_id`);
      return { status: 'ignored' };
    }

    const result = await setPaymentStatusByReference(data.order_id, newStatus);
    if (result.kind === 'notfound') {
      console.warn(`SumoPod webhook: no registration for order_id ${data.order_id}`);
    }

    return { status: 'ok' };
  },
);
