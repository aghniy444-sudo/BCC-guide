import { describe, it, expect, afterEach } from 'vitest';
import { resolvePaymentMode } from '@/lib/checkout';

const KEYS = ['KLIKQRIS_API_KEY', 'KLIKQRIS_MERCHANT_ID'] as const;

const env = process.env as Record<string, string | undefined>;
const ORIGINAL: Record<string, string | undefined> = {};
for (const k of KEYS) ORIGINAL[k] = process.env[k];

afterEach(() => {
  for (const k of KEYS) {
    if (ORIGINAL[k] === undefined) delete env[k];
    else env[k] = ORIGINAL[k];
  }
});

describe('resolvePaymentMode (fail-closed)', () => {
  it('refuses checkout without KlikQRIS credentials', () => {
    delete env.KLIKQRIS_API_KEY;
    delete env.KLIKQRIS_MERCHANT_ID;
    const r = resolvePaymentMode();
    expect(r.mode).toBeNull();
    expect(r.reason).toBe('klikqris_credentials_missing');
  });

  it('refuses checkout when only one credential is present', () => {
    env.KLIKQRIS_API_KEY = 'k';
    delete env.KLIKQRIS_MERCHANT_ID;
    expect(resolvePaymentMode().mode).toBeNull();
  });

  it('enables the live KlikQRIS mode when both credentials are present', () => {
    env.KLIKQRIS_API_KEY = 'k';
    env.KLIKQRIS_MERCHANT_ID = 'm';
    expect(resolvePaymentMode().mode).toBe('klikqris');
  });
});
