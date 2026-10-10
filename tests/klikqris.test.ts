import { describe, it, expect, vi, afterEach } from 'vitest';
import { getQrisStatus, createQris } from '@/lib/klikqris';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('klikqris production client', () => {
  it('parses a create response and returns the authoritative total', async () => {
    process.env.KLIKQRIS_API_KEY = 'key';
    process.env.KLIKQRIS_MERCHANT_ID = 'merchant';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            status: true,
            data: {
              order_id: 'BCC-1',
              total_amount: '50021.00',
              qris_url: 'https://x/qr',
              direct_url: 'https://x/pay',
              signature: 'sig',
            },
          }),
          { status: 200 },
        ),
      ),
    );

    const res = await createQris({ orderId: 'BCC-1', amount: 50000, keterangan: 'x' });
    expect(res.gatewayOrderId).toBe('BCC-1');
    expect(res.totalAmount).toBe(50021);
    expect(res.paymentUrl).toBe('https://x/pay');
    expect(res.signature).toBe('sig');
  });

  it('normalizes the status API response', async () => {
    process.env.KLIKQRIS_API_KEY = 'key';
    process.env.KLIKQRIS_MERCHANT_ID = 'merchant';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ status: true, data: { status: 'success' } }), { status: 200 })),
    );
    const res = await getQrisStatus('BCC-1');
    expect(res.status).toBe('SUCCESS');
  });

  it('throws when credentials are missing', async () => {
    delete process.env.KLIKQRIS_API_KEY;
    delete process.env.KLIKQRIS_MERCHANT_ID;
    await expect(getQrisStatus('BCC-1')).rejects.toThrow('klikqris_credentials_missing');
  });

  it('throws when the gateway rejects the create request', async () => {
    process.env.KLIKQRIS_API_KEY = 'key';
    process.env.KLIKQRIS_MERCHANT_ID = 'merchant';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ status: false, message: 'nope' }), { status: 200 })),
    );
    await expect(createQris({ orderId: 'BCC-1', amount: 1000, keterangan: 'x' })).rejects.toThrow(
      'klikqris_create_rejected',
    );
  });
});
