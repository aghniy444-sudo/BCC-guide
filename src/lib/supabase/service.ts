import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Concrete type of the service-role client, for callers that take it as an argument. */
export type ServiceClient = SupabaseClient;

/**
 * Service-role Supabase client. Bypasses RLS.
 * MUST only ever be imported by server-only code (server actions, route
 * handlers, scripts). Never import from a client component.
 */
export function createServiceClient(): ServiceClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error(
      'Supabase service client misconfigured: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required.',
    );
  }
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
