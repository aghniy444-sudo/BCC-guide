// Uploads generated sample files to the private 'content' Storage bucket and
// upserts the matching `assets` rows by stable storage_path (idempotent).
//
// Prereqs: run `node scripts/generate-samples.mjs` first, and provide
// NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY via .env.local.
//
// Usage: node scripts/seed-samples.mjs

import { readFile, readdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const OUT_DIR = path.resolve('.sample-build');
const BUCKET = 'content';

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY (set in .env.local).');
    process.exit(1);
  }
  if (!existsSync(OUT_DIR)) {
    console.error(`No sample build found at ${OUT_DIR}. Run: node scripts/generate-samples.mjs`);
    process.exit(1);
  }

  const supabase = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const files = await readdir(OUT_DIR);
  const plan = [];

  for (const file of files) {
    if (file === 'guide.pdf') {
      plan.push({ file, kind: 'guide', storage_path: 'guide/guide.pdf', title: 'Guide Book Business Case Competition (contoh)' });
    } else if (file.startsWith('free-deck-')) {
      plan.push({ file, kind: 'free_deck', storage_path: `free/${file}`, title: `Free Deck (contoh) ${file}` });
    } else if (file.startsWith('deck-')) {
      plan.push({ file, kind: 'decks', storage_path: `decks/${file}`, title: `Template Deck (contoh) ${file}` });
    }
  }

  if (plan.length === 0) {
    console.error('No sample files matched. Run generate-samples.mjs first.');
    process.exit(1);
  }

  const contentType = (f) =>
    f.endsWith('.pdf')
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

  for (const item of plan) {
    const data = await readFile(path.join(OUT_DIR, item.file));
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(item.storage_path, data, { contentType: contentType(item.file), upsert: true });
    if (upErr) {
      console.error(`Upload failed for ${item.file}:`, upErr.message);
      process.exit(1);
    }

    const { error: dbErr } = await supabase.from('assets').upsert(
      {
        kind: item.kind,
        title: item.title,
        storage_path: item.storage_path,
        is_sample: true,
        published: true,
      },
      { onConflict: 'storage_path' },
    );
    if (dbErr) {
      console.error(`Asset upsert failed for ${item.file}:`, dbErr.message);
      process.exit(1);
    }
    console.log('seeded', item.storage_path);
  }

  console.log(`Seeded ${plan.length} assets into bucket '${BUCKET}'.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
