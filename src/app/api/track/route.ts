import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/service';

const VISITOR_COOKIE = 'bcc_vid';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Records one landing-page visit for the current browser. The visitor id is a
 * long-lived cookie so repeat visits can be counted as unique visitors.
 */
export async function POST() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VISITOR_COOKIE)?.value;
  const visitorId = existing && UUID.test(existing) ? existing : crypto.randomUUID();

  const svc = createServiceClient();
  const { error } = await svc.rpc('track_visit', { p_visitor_id: visitorId });

  const response = NextResponse.json({ ok: !error });
  if (existing !== visitorId) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}
