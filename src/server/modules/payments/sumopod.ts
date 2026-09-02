import crypto from 'node:crypto';
import ky, { HTTPError } from 'ky';

/**
 * SumoPod payment-gateway client. Docs: https://sumopod.com (Managed Payment).
 * Base URL and credentials come from env — see .env.example.
 */
const SUMOPOD_BASE_URL = process.env.SUMOPOD_BASE_URL || 'https://api-pay.sumopod.com/api/v1';
const SUMOPOD_API_KEY = process.env.SUMOPOD_API_KEY;

export type CreatePaymentInput = {
  orderId: string;
  /** Amount in the smallest whole currency unit SumoPod expects (IDR = rupiah, no decimals). */
  amount: number;
  currency?: string;
  /** Max 24 per SumoPod docs; omit to default to 24. */
  expiresInHours?: number;
  successReturnUrl?: string;
  cancelReturnUrl?: string;
  paymentMethodTypeCode?: string;
};

export type SumoPodPayment = {
  payment_id: string;
  order_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  payment_link_url: string;
  status: string;
  expires_at: string;
};

export class SumoPodError extends Error {
  constructor(message: string, public status: number, public body: unknown) {
    super(message);
    this.name = 'SumoPodError';
  }
}

/** Create a SumoPod payment link. Throws `SumoPodError` on a non-2xx response. */
export async function createPayment(input: CreatePaymentInput): Promise<SumoPodPayment> {
  if (!SUMOPOD_API_KEY) throw new Error('SUMOPOD_API_KEY tidak dikonfigurasi');

  try {
    return await ky
      .post(`${SUMOPOD_BASE_URL}/payments`, {
        headers: { 'X-Api-Key': SUMOPOD_API_KEY },
        json: {
          order_id: input.orderId,
          amount: input.amount,
          currency: input.currency ?? 'IDR',
          expires_in_hours: input.expiresInHours,
          success_return_url: input.successReturnUrl,
          cancel_return_url: input.cancelReturnUrl,
          payment_method_type_code: input.paymentMethodTypeCode,
        },
        timeout: 15_000,
        retry: 0,
      })
      .json<SumoPodPayment>();
  } catch (err) {
    if (err instanceof HTTPError) {
      const body = await err.response.json().catch(() => null);
      throw new SumoPodError(
        (body && typeof body === 'object' && 'message' in body && String(body.message)) ||
          `SumoPod create payment failed (${err.response.status})`,
        err.response.status,
        body,
      );
    }
    throw err;
  }
}

/**
 * Verify a SumoPod webhook signature (Svix format). `secret` is the
 * `whsec_...` signing secret from the SumoPod project Settings tab.
 */
export function verifyWebhookSignature(
  secret: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  rawBody: string,
): boolean {
  const secretBytes = Buffer.from(secret.replace('whsec_', ''), 'base64');
  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;

  const expectedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  const signatures = svixSignature.split(' ').map((s) => s.split(',')[1]);
  return signatures.includes(expectedSignature);
}

/** Simpler alternative to signature verification — direct token comparison. */
export function verifyWebhookToken(expectedToken: string, receivedToken: string | null): boolean {
  if (!receivedToken) return false;
  const a = Buffer.from(expectedToken);
  const b = Buffer.from(receivedToken);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
