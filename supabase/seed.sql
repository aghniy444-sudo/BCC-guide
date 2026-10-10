-- BCC Guide seed: the three products only.
-- Assets/posts are created by admins (or scripts/seed-samples.mjs), so the app
-- boots and renders empty states before any files are uploaded.

insert into public.products (id, title, description, price_idr, active) values
  ('guide',
   'Guide Book Business Case Competition',
   'E-book panduan lengkap menyusun business case competition: kerangka analisis, struktur slide, dan contoh studi kasus.',
   30000, true),
  ('decks',
   'Template Deck Competition',
   'Paket 11 template deck siap pakai untuk lomba business case competition.',
   35000, true),
  ('bundle',
   'Bundel Guide Book + Template Deck',
   'Paket hemat: Guide Book dan seluruh 11 template deck sekaligus.',
   50000, true)
on conflict (id) do update
  set title = excluded.title,
      description = excluded.description,
      price_idr = excluded.price_idr,
      active = excluded.active;
