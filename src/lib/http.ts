/**
 * Read a JSON body from a fetch `Response` without throwing.
 *
 * A response can legitimately have an empty or non-JSON body even when the
 * status looks fine: gateway timeouts, proxy/edge error pages, 204s, or a
 * truncated stream. Calling `res.json()` directly on those throws
 * `Failed to execute 'json' on 'Response': Unexpected end of JSON input`,
 * which surfaces to the user as an opaque failure.
 *
 * Returns `null` for an empty or unparseable body so callers can decide how to
 * report it.
 */
export async function readJson<T = unknown>(res: Response): Promise<T | null> {
  try {
    const text = await res.text();
    if (!text.trim()) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
