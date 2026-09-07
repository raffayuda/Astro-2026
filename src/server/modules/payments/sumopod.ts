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
  payment_code?: string | null;
  payment_code_type?: string | null;
  payment_channel_used?: string | null;
  status: string;
  expires_at: string;
};

export type SumoPodPublicCheckout = {
  status: 'pending' | 'completed' | 'canceled' | 'expired' | string;
  order_id: string;
  amount: number;
  currency: string;
  expires_at: string;
  payment_code?: string | null;
  payment_code_type?: string | null;
  payment_channel_used?: string | null;
  success_return_url?: string | null;
  cancel_return_url?: string | null;
  logo_url?: string | null;
  merchant_name?: string | null;
};

/**
 * Fetch live public checkout state directly from SumoPod or its managed checkout platform (e.g. checkout.pymnt.app).
 * Useful for active sync when polling, checking status, or extracting QRIS payload.
 */
export async function fetchPublicPaymentCheckout(
  paymentIdOrUrl: string,
  paymentLinkUrl?: string | null,
): Promise<SumoPodPublicCheckout | null> {
  const targetUrl = paymentLinkUrl || (paymentIdOrUrl?.startsWith('http') ? paymentIdOrUrl : null);
  const paymentId = !paymentIdOrUrl?.startsWith('http') ? paymentIdOrUrl : null;

  // 1. Direct managed checkout API (e.g. checkout.pymnt.app/api/checkout/{id})
  if (targetUrl) {
    try {
      const urlObj = new URL(targetUrl);
      const checkoutId = urlObj.pathname.split('/').filter(Boolean).pop();
      if (checkoutId) {
        const checkoutApiUrl = `${urlObj.origin}/api/checkout/${checkoutId}`;
        const res = await ky
          .get(checkoutApiUrl, {
            headers: {
              Accept: 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            timeout: 6_000,
            retry: 0,
          })
          .json<any>();

        if (res) {
          const rawStatus = (res.status || '').toLowerCase();
          const normalizedStatus =
            rawStatus === 'completed' || rawStatus === 'paid' || rawStatus === 'success'
              ? 'completed'
              : rawStatus === 'canceled' || rawStatus === 'cancelled'
              ? 'canceled'
              : rawStatus === 'expired'
              ? 'expired'
              : rawStatus === 'failed'
              ? 'failed'
              : 'pending';

          const paymentCode = res.paymentCode || null;
          const paymentCodeType =
            res.paymentCodeType || (paymentCode?.startsWith('000201') ? 'QR_TEXT' : null);

          return {
            status: normalizedStatus,
            order_id: res.referenceCode || '',
            amount: Number(res.initiatedAmount || res.amount || 0),
            currency: res.currency || 'IDR',
            expires_at: res.expirationTime || '',
            payment_code: paymentCode,
            payment_code_type: paymentCodeType,
            payment_channel_used: res.paymentChannel || 'QRIS',
          };
        }
      }
    } catch {
      // Continue to next fallback
    }

    // 2. Fallback: Parse paymentCode from HTML page of targetUrl
    try {
      const html = await ky
        .get(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          timeout: 6_000,
          retry: 0,
        })
        .text();

      const codeMatch =
        html.match(/\\"paymentCode\\":\\"([^"\\]+)\\"/) ||
        html.match(/"paymentCode"\s*:\s*"([^"]+)"/) ||
        html.match(/000201010212[0-9A-Za-z.=-]+/);

      if (codeMatch) {
        const paymentCode = codeMatch[1] || codeMatch[0];
        const typeMatch =
          html.match(/\\"paymentCodeType\\":\\"([^"\\]+)\\"/) ||
          html.match(/"paymentCodeType"\s*:\s*"([^"]+)"/);

        return {
          status: 'pending',
          order_id: '',
          amount: 0,
          currency: 'IDR',
          expires_at: '',
          payment_code: paymentCode,
          payment_code_type: typeMatch ? typeMatch[1] : 'QR_TEXT',
          payment_channel_used: 'QRIS',
        };
      }
    } catch {
      // Continue to legacy fallback
    }
  }

  // 3. SumoPod API direct public checkout (legacy fallback)
  if (paymentId) {
    try {
      return await ky
        .get(`${SUMOPOD_BASE_URL}/public/payments/${encodeURIComponent(paymentId)}/checkout`, {
          timeout: 6_000,
          retry: 0,
        })
        .json<SumoPodPublicCheckout>();
    } catch {
      return null;
    }
  }

  return null;
}

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

  const paymentMethod =
    input.paymentMethodTypeCode ||
    process.env.SUMOPOD_DEFAULT_PAYMENT_METHOD ||
    'QRIS';

  if (successUrl) payload.success_return_url = successUrl;
  if (cancelUrl) payload.cancel_return_url = cancelUrl;
  if (paymentMethod) payload.payment_method_type_code = paymentMethod;

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
      let body: any = (err as any).data;
      let rawText = '';
      if (!body) {
        rawText = await err.response.text().catch(() => '');
        try {
          body = JSON.parse(rawText);
        } catch {
          body = rawText;
        }
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
