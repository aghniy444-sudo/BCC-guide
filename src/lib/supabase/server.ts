import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client bound to the request cookies.
 * Used by server components and route handlers to read the user session.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore; proxy.ts refreshes.
          }
        },
      },
    },
  );
}

/** Returns the verified claims for the current request, or null. */
export async function getClaims() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error) return null;
  return data?.claims ?? null;
}

export interface ActiveProfile {
  id: string;
  email: string | null;
  role: 'admin' | 'user';
  disabled: boolean;
}

/**
 * Loads the profile row for the current user. Returns null when there is no
 * session, or when the profile is disabled (treated as unauthenticated).
 */
export async function getActiveProfile(): Promise<ActiveProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role, disabled')
    .eq('id', claims.sub)
    .maybeSingle();

  if (!profile || profile.disabled) return null;
  return profile as ActiveProfile;
}
