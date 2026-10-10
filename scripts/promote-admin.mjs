// Promotes an already-created (and confirmed) account to admin.
// Server-only: requires SUPABASE_SECRET_KEY. There is no hardcoded admin email
// and no auto-promotion of the first signup.
//
// Usage: node scripts/promote-admin.mjs <user-uuid>

import { existsSync, readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue;
    const text = readFileSync(file, 'utf8');
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

async function main() {
  loadEnv();
  const userId = process.argv[2];
  if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
    console.error('Usage: node scripts/promote-admin.mjs <user-uuid>');
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY (set in .env.local).');
    process.exit(1);
  }

  const supabase = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin', disabled: false })
    .eq('id', userId)
    .select('id, email, role')
    .maybeSingle();

  if (error) {
    console.error('Promotion failed:', error.message);
    process.exit(1);
  }
  if (!data) {
    console.error(`No profile found for ${userId}. Create and confirm the account first.`);
    process.exit(1);
  }
  console.log(`Promoted ${data.email ?? data.id} to admin.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
