import { describe, it, expect } from 'vitest';
import { readJson } from '@/lib/http';

describe('readJson', () => {
  it('parses a JSON body', async () => {
    const res = new Response(JSON.stringify({ order: { id: 'o1' } }), { status: 200 });
    await expect(readJson<{ order: { id: string } }>(res)).resolves.toEqual({ order: { id: 'o1' } });
  });

  it('returns null for an empty body instead of throwing', async () => {
    await expect(readJson(new Response('', { status: 200 }))).resolves.toBeNull();
  });

  it('returns null for whitespace-only bodies', async () => {
    await expect(readJson(new Response('   \n', { status: 200 }))).resolves.toBeNull();
  });

  it('returns null for an HTML error page body', async () => {
    await expect(readJson(new Response('<html>502 Bad Gateway</html>', { status: 200 }))).resolves.toBeNull();
  });

  it('returns null for a truncated JSON body', async () => {
    await expect(readJson(new Response('{"order":', { status: 200 }))).resolves.toBeNull();
  });
});
