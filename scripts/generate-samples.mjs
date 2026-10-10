// Generates demo sample content into ./.sample-build/ (gitignored):
//   - guide.pdf            : watermarked "CONTOH / DEMO" guide book PDF
//   - free-deck-1..3.pptx  : three free sample decks
//   - deck-01..11.pptx     : eleven paid template decks
// All files carry an explicit "CONTOH / DEMO" label — they are placeholders,
// not the final product material.
//
// Usage: node scripts/generate-samples.mjs

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import PptxGenJS from 'pptxgenjs';

const OUT_DIR = path.resolve('.sample-build');

async function generateGuidePdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const body = await doc.embedFont(StandardFonts.Helvetica);

  const sections = [
    {
      title: 'Guide Book Business Case Competition',
      lines: [
        'Dokumen ini adalah CONTOH / DEMO, bukan materi final.',
        'Bab 1 — Memahami Soal Business Case',
        'Bab 2 — Kerangka Analisis (Problem, Data, Opsi, Rekomendasi)',
        'Bab 3 — Menyusun Struktur Slide yang Meyakinkan',
        'Bab 4 — Contoh Studi Kasus & Pembahasan',
        'Bab 5 — Tips Presentasi dan Q&A Juri',
      ],
    },
    {
      title: 'Contoh Bab: Kerangka Analisis',
      lines: [
        '1. Definisikan masalah utama dari brief lomba.',
        '2. Kumpulkan data pendukung dan asumsi eksplisit.',
        '3. Susun alternatif opsi beserta trade-off-nya.',
        '4. Pilih rekomendasi dengan kriteria yang jelas.',
        '5. Tutup dengan rencana implementasi singkat.',
      ],
    },
  ];

  for (const section of sections) {
    const page = doc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    page.drawText(section.title, {
      x: 50,
      y: height - 80,
      size: 20,
      font,
      color: rgb(0.1, 0.1, 0.2),
    });
    section.lines.forEach((line, i) => {
      page.drawText(line, {
        x: 50,
        y: height - 130 - i * 24,
        size: 12,
        font: body,
        color: rgb(0.15, 0.15, 0.25),
      });
    });
    page.drawText('CONTOH / DEMO', {
      x: width / 2 - 70,
      y: height / 2,
      size: 60,
      font,
      color: rgb(0.9, 0.85, 0.95),
      opacity: 0.35,
      rotate: { type: 'degrees', angle: 30 },
    });
  }

  const bytes = await doc.save();
  await writeFile(path.join(OUT_DIR, 'guide.pdf'), bytes);
  return 'guide.pdf';
}

function deckSlide(pptx, title, subtitle) {
  const slide = pptx.addSlide();
  slide.background = { color: '0B0B1A' };
  slide.addText('CONTOH / DEMO', {
    x: 0.3,
    y: 0.2,
    w: 4,
    h: 0.4,
    fontSize: 12,
    color: 'C4B5FD',
    bold: true,
  });
  slide.addText(title, {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 1.2,
    fontSize: 30,
    color: 'FFFFFF',
    bold: true,
  });
  slide.addText(subtitle, {
    x: 0.5,
    y: 3.2,
    w: 9,
    h: 0.8,
    fontSize: 16,
    color: 'A78BFA',
  });
  return slide;
}

const DECK_TITLES = [
  'Judul & Pembuka',
  'Executive Summary',
  'Latar Belakang Masalah',
  'Analisis Situasi',
  'Segmentasi Pasar',
  'Analisis Kompetitor',
  'Insight Data',
  'Alternatif Strategi',
  'Evaluasi Opsi',
  'Rekomendasi',
  'Rencana Implementasi',
];

async function generateDeck(fileName, title, subtitle) {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'WIDE', width: 10, height: 5.63 });
  pptx.layout = 'WIDE';
  deckSlide(pptx, title, subtitle);
  await pptx.writeFile({ fileName: path.join(OUT_DIR, fileName) });
  return fileName;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const created = [];

  created.push(await generateGuidePdf());

  for (let i = 1; i <= 3; i += 1) {
    created.push(
      await generateDeck(
        `free-deck-${i}.pptx`,
        `Free Deck ${i}`,
        `Contoh deck gratis ${i} untuk business case competition`,
      ),
    );
  }

  for (let i = 0; i < DECK_TITLES.length; i += 1) {
    const n = String(i + 1).padStart(2, '0');
    created.push(
      await generateDeck(
        `deck-${n}.pptx`,
        `Template Deck ${n} — ${DECK_TITLES[i]}`,
        'Template berbayar (contoh/demo)',
      ),
    );
  }

  console.log(`Generated ${created.length} sample files in ${OUT_DIR}:`);
  for (const f of created) console.log('  -', f);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
