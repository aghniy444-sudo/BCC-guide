import { describe, it, expect } from 'vitest';
import {
  ASSET_MAX_BYTES,
  PRODUCT_IMAGE_MAX_BYTES,
  SERVER_ACTION_BODY_LIMIT,
} from '@/lib/upload';

/** Parse the `bytes`-style size strings used by Next.js config. */
function parseSizeLimit(value: string): number {
  const match = /^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/i.exec(value.trim());
  if (!match) throw new Error(`unparseable size limit: ${value}`);
  const units: Record<string, number> = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 };
  return Number(match[1]) * (units[(match[2] ?? 'b').toLowerCase()] ?? 1);
}

describe('upload limits', () => {
  // Regression: the Server Action body cap was left at the Next.js default of
  // 1 MB while the forms advertised larger uploads, so the framework rejected
  // the request before the action could report a readable error.
  it('keeps the server action body cap above the largest allowed upload', () => {
    expect(parseSizeLimit(SERVER_ACTION_BODY_LIMIT)).toBeGreaterThan(ASSET_MAX_BYTES);
  });

  it('leaves multipart overhead room above the asset limit', () => {
    expect(parseSizeLimit(SERVER_ACTION_BODY_LIMIT) - ASSET_MAX_BYTES).toBeGreaterThan(64 * 1024);
  });

  it('keeps the product image limit below the asset limit', () => {
    expect(PRODUCT_IMAGE_MAX_BYTES).toBeLessThan(ASSET_MAX_BYTES);
  });

  it('keeps the product image limit above the Next.js default body cap', () => {
    // Otherwise the client-side guard would never be the binding constraint and
    // the framework would still reject the upload before the action runs.
    expect(PRODUCT_IMAGE_MAX_BYTES).toBeGreaterThan(1024 * 1024);
    expect(parseSizeLimit(SERVER_ACTION_BODY_LIMIT)).toBeGreaterThan(PRODUCT_IMAGE_MAX_BYTES);
  });
});
