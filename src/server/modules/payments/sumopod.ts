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

  // SumoPod regex requires order_id to match ^[a-zA-Z0-9-_]+$
  const safeOrderId = input.orderId.replace(/[^a-zA-Z0-9-_]/g, '-');

  // SumoPod validates return URLs with /^https:\/\//; omit when running locally on http://
  const successUrl =
    input.successReturnUrl && input.successReturnUrl.startsWith('https://')
      ? input.successReturnUrl
      : undefined;
  const cancelUrl =
    input.cancelReturnUrl && input.cancelReturnUrl.startsWith('https://')
      ? input.cancelReturnUrl
      : undefined;

  const payload: Record<string, unknown> = {
    order_id: safeOrderId,
    amount: Math.round(input.amount),
    currency: input.currency ?? 'IDR',
    expires_in_hours: input.expiresInHours ?? 24,
  };

  if (successUrl) payload.success_return_url = successUrl;
  if (cancelUrl) payload.cancel_return_url = cancelUrl;
  if (input.paymentMethodTypeCode) payload.payment_method_type_code = input.paymentMethodTypeCode;

  if (input.amount < 1000) {
    throw new SumoPodError(
      `Nominal pembayaran (Rp ${input.amount.toLocaleString('id-ID')}) di bawah batas minimum transaksi gateway pembayaran (minimal Rp 1.000). Jika lomba ini gratis, silakan atur status biaya menjadi 'Gratis' di dashboard admin.`,
      400,
      null,
    );
  }

  try {
    return await ky
      .post(`${SUMOPOD_BASE_URL}/payments`, {
        headers: { 'X-Api-Key': SUMOPOD_API_KEY },
        json: payload,
        timeout: 15_000,
        retry: 0,
      })
      .json<SumoPodPayment>();
  } catch (err) {
    if (err instanceof HTTPError) {
      const rawText = await err.response.text().catch(() => '');
      let body: any = null;
      try {
        body = JSON.parse(rawText);
      } catch {
        body = rawText;
      }
      console.error('SumoPod API error detail:', {
        status: err.response.status,
        body,
        raw: rawText,
        payload: JSON.stringify(payload),
      });
      const message =
        (body && typeof body === 'object' && ('message' in body || 'error' in body) && (body.message || body.error)) ||
        rawText ||
        `SumoPod create payment failed (${err.response.status})`;
      throw new SumoPodError(String(message), err.response.status, body);
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
