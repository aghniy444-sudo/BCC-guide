import { NextResponse } from 'next/server';
import { getActiveProfile } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

const SIGNED_URL_TTL_SECONDS = 60;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getActiveProfile();
  if (!profile) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const svc = createServiceClient();

  const { data: asset } = await svc
    .from('assets')
    .select('id, kind, storage_path, published')
    .eq('id', id)
    .maybeSingle();

  if (!asset) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (!asset.published) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Authorize by kind. free_deck -> any active account; guide/decks -> entitlement.
  if (asset.kind !== 'free_deck') {
    if (profile.role !== 'admin') {
      const supabase = await createClient();
      const { data: entitlement } = await supabase
        .from('entitlements')
        .select('kind')
        .eq('user_id', profile.id)
        .eq('kind', asset.kind)
        .maybeSingle();
      if (!entitlement) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 });
      }
    }
  }

  const { data: signed, error } = await svc.storage
    .from('content')
    .createSignedUrl(asset.storage_path, SIGNED_URL_TTL_SECONDS);

  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: 'sign_failed' }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl, {
    status: 302,
    headers: { 'Cache-Control': 'no-store' },
  });
}
