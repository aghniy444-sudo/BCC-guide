export interface Book {
  id: string;
  title: string;
  subtitle: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  category: 'ai' | 'design' | 'architecture';
  categoryLabel: string;
  rating: number;
  reviewCount: number;
  pageCount: number;
  caseStudies: number;
  price: number;
  originalPrice: number;
  badge?: string;
  bundleTag?: string;
  discountBadge?: string;
  coverImage: string;
  formats: string[];
  description: string;
  keyTakeaways: string[];
  tableOfContents: {
    chapter: string;
    title: string;
    duration: string;
  }[];
  sampleExcerpt: {
    chapterNumber: string;
    chapterTitle: string;
    content: string[];
  };
}

export const BOOKS_DATA: Book[] = [
  {
    id: 'ai-engineering',
    title: 'Modern AI Engineering Handbook',
    subtitle: 'A Comprehensive Guide to Building Scalable, Production-Ready Artificial Intelligence Systems',
    author: {
      name: 'The AI Experts Group',
      role: 'Staff ML Engineers & AI Researchers',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    category: 'ai',
    categoryLabel: 'Artificial Intelligence',
    rating: 4.9,
    reviewCount: 1420,
    pageCount: 520,
    caseStudies: 42,
    price: 169000,
    originalPrice: 253000,
    badge: 'Bestseller 2026',
    bundleTag: 'Bundling E-Book & Codebase',
    discountBadge: '33% OFF',
    coverImage: '/books/ai-engineering.jpg',
    formats: ['PDF (Print-Ready)', 'ePub (Kindle/iPad)', 'GitHub Codebase', 'Notion Checklists'],
    description: 'Panduan definitif untuk insinyur perangkat lunak yang ingin beralih membangun aplikasi AI tingkat produksi. Membahas arsitektur LLM, RAG skala besar, AI Agent orchestration, hingga evaluasi dan optimasi biaya token.',
    keyTakeaways: [
      'Arsitektur RAG Hybrid dengan Vector & Knowledge Graph',
      'Orkestrasi Multi-Agent mandiri dengan tool-calling deterministik',
      'Benchmark latensi, cache semantik, dan teknik kompresi prompt',
      'Repository 100% siap deploy dengan Docker dan Kubernetes'
    ],
    tableOfContents: [
      { chapter: 'Bab 1', title: 'Fondasi Modern AI: Dari Prediktif ke Reasoning LLM', duration: '28 hal' },
      { chapter: 'Bab 2', title: 'Arsitektur RAG Produksi: Chunking & Hybrid Search', duration: '54 hal' },
      { chapter: 'Bab 3', title: 'State Machine & Agent Orchestration Loop', duration: '62 hal' },
      { chapter: 'Bab 4', title: 'Prompt Optimization, Semantic Caching & Guardrails', duration: '46 hal' },
      { chapter: 'Bab 5', title: 'Evaluasi Otomatis (Evals), Observability & Red Teaming', duration: '58 hal' },
      { chapter: 'Bab 6', title: 'Deployment, GPU Serving & Cost Optimization', duration: '48 hal' },
    ],
    sampleExcerpt: {
      chapterNumber: 'Bab 1',
      chapterTitle: 'Fondasi Modern AI: Dari Prediktif ke Reasoning LLM',
      content: [
        'Transisi dari software deterministik ke probabilistic system bukanlah sekadar mengganti function call dengan model inference. Ini membutuhkan paradigma rekayasa perangkat lunak yang sepenuhnya baru.',
        'Ketika kita membangun sistem kecerdasan buatan untuk skala produksi, tantangan terbesar bukanlah memanggil API model, melainkan menjamin konsistensi, keandalan output, serta penanganan latensi dalam batasan SLA ketat.',
        'Dalam buku ini, setiap bab dirancang berbasis arsitektur nyata yang telah teruji melayani jutaan inferensi per hari di industri teknologi modern.'
      ]
    }
  },
  {
    id: 'uiux-mastery',
    title: 'UI/UX Design Systems Mastery',
    subtitle: 'The Definitive Guide to Building, Scaling, and Maintaining Robust Design Systems',
    author: {
      name: 'Michael Lindgren',
      role: 'Principal Design Technologist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    category: 'design',
    categoryLabel: 'UI/UX & Design Systems',
    rating: 4.9,
    reviewCount: 980,
    pageCount: 410,
    caseStudies: 36,
    price: 189000,
    originalPrice: 299000,
    badge: 'Winner Class & Module',
    bundleTag: 'Bundling E-Book & Figma Kit',
    discountBadge: '37% OFF',
    coverImage: '/books/uiux-mastery.jpg',
    formats: ['PDF Interactive', 'Figma Starter Kit', 'Design Tokens Schema', 'ePub'],
    description: 'Panduan lengkap dan terstruktur langkah demi langkah untuk merancang, mengkodifikasi, dan mendistribusikan Design System skala enterprise yang menjembatani designer dan developer secara harmonis.',
    keyTakeaways: [
      'Pembuatan arsitektur Design Tokens multi-brand dan multi-theme',
      'Metodologi penamaan komponen atomic yang konsisten',
      'Sinkronisasi Figma to Code dengan Style Dictionary & CI/CD',
      'Governance framework agar design system diadopsi lintas divisi'
    ],
    tableOfContents: [
      { chapter: 'Bab 1', title: 'Anatomi Design System Skala Besar', duration: '32 hal' },
      { chapter: 'Bab 2', title: 'Fondasi Visual: Grid, Spacing, Typography & Color Math', duration: '48 hal' },
      { chapter: 'Bab 3', title: 'Design Tokens: Dari Konsep ke Pipeline Otomatis', duration: '56 hal' },
      { chapter: 'Bab 4', title: 'Merancang Komponen Interaktif & Status Kompleks', duration: '64 hal' },
      { chapter: 'Bab 5', title: 'Aksesibilitas (WCAG 2.2) Terintegrasi Sejak Desain', duration: '40 hal' },
      { chapter: 'Bab 6', title: 'Adopsi, Dokumentasi Interaktif & Governance Organisasi', duration: '44 hal' },
    ],
    sampleExcerpt: {
      chapterNumber: 'Bab 1',
      chapterTitle: 'Anatomi Design System Skala Besar',
      content: [
        'Sebuah Design System bukanlah sekadar library komponen di Figma, dan bukan pula sekadar kumpulan CSS file di repositori kode. Design system adalah produk internal yang membutuhkan visi, tata kelola, dan siklus hidup berkelanjutan.',
        'Ketika tim produk bertumbuh dari 10 menjadi 100 desainer dan teknisi, ketidaksinkronan estetika dan redudansi kode menjadi musuh nomor satu kecepatan rilis produk.',
        'Dengan mengadopsi Design Tokens berjenjang (Global, Semantic, Component-level), kita menciptakan sumber kebenaran tunggal yang dapat diperbarui dalam hitungan detik tanpa risiko regresi tampilan.'
      ]
    }
  },
  {
    id: 'distributed-systems',
    title: 'Distributed Systems & Cloud Architecture',
    subtitle: 'Principles, Design, and Engineering of Modern Scalable Applications',
    author: {
      name: 'Robert J. Chen, PhD',
      role: 'Distinguished Cloud Architect',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    category: 'architecture',
    categoryLabel: 'Software Architecture',
    rating: 5.0,
    reviewCount: 1680,
    pageCount: 590,
    caseStudies: 52,
    price: 199000,
    originalPrice: 289000,
    badge: 'Staff Recommended',
    bundleTag: 'Bundling E-Book & Arch Pack',
    discountBadge: '30% OFF',
    coverImage: '/books/distributed-systems.jpg',
    formats: ['PDF Printable', 'ePub', 'Helm Charts Repo', 'Arch Diagrams Pack'],
    description: 'Panduan teknis mendalam tentang bagaimana merancang sistem berdaya tahan tinggi, konsistensi data terdistribusi (Event-Driven & Saga Pattern), idempotensi, failover, dan observabilitas cloud-native.',
    keyTakeaways: [
      'Pola konsistensi data transaksional: Two-Phase Commit vs Saga',
      'Penyusunan arsitektur Event-Driven dengan Kafka & Debezium CDC',
      'Handling kegagalan: Circuit breaker, backpressure, dan jittered retry',
      'Blueprints arsitektur nyata yang melayani 100K+ RPS dengan latensi p99 rendah'
    ],
    tableOfContents: [
      { chapter: 'Bab 1', title: 'Hukum dan Fallacies Komputasi Terdistribusi', duration: '34 hal' },
      { chapter: 'Bab 2', title: 'Pola Komunikasi Service-to-Service: gRPC vs Asynchronous', duration: '50 hal' },
      { chapter: 'Bab 3', title: 'Manajemen Transaksi Terdistribusi & Outbox Pattern', duration: '68 hal' },
      { chapter: 'Bab 4', title: 'Data Partitioning, Sharding & Caching Strategies', duration: '62 hal' },
      { chapter: 'Bab 5', title: 'Observability Tiga Pilar: Distributed Tracing, Logs, Metrics', duration: '54 hal' },
      { chapter: 'Bab 6', title: 'Chaos Engineering & Disaster Recovery Runbooks', duration: '46 hal' },
    ],
    sampleExcerpt: {
      chapterNumber: 'Bab 1',
      chapterTitle: 'Hukum dan Fallacies Komputasi Terdistribusi',
      content: [
        'Setiap arsitek software pemula membuat asumsi yang sama: jaringan itu andal, latensinya nol, dan bandwidth tidak terbatas. Namun realitas di lapangan produksi membuktikan bahwa jaringan selalu dapat terputus kapan saja.',
        'Merancang sistem terdistribusi berarti mengantisipasi kondisi ketika sebagian komponen mati sementara sistem utama tetap harus memberikan respons valid kepada pengguna.',
        'Panduan ini menyajikan pola-pola defensif yang diuji dalam pertempuran sistem perbankan dan e-commerce global.'
      ]
    }
  }
];

export const TESTIMONIALS = [
  {
    name: 'Dimas Pratama',
    role: 'Lead Backend Engineer @ Unicorn Fintech',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    content: 'Handbook Distributed Systems ini menghemat ratusan jam riset tim kami. Konsep Saga Pattern dan Outbox dibahas begitu gamblang dengan diagram yang langsung bisa diadaptasi ke arsitektur kami.',
    bookTitle: 'Distributed Systems & Cloud Architecture',
    rating: 5,
  },
  {
    name: 'Sarah Amanda',
    role: 'Senior Product Designer @ SaaS Global',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    content: 'UI/UX Design Systems Mastery adalah buku paling praktis yang pernah saya beli tahun ini. Sangat detail dari struktur tokens hingga integrasi GitHub CI/CD untuk desainer.',
    bookTitle: 'UI/UX Design Systems Mastery',
    rating: 5,
  },
  {
    name: 'Rian Syahputra',
    role: 'AI Researcher & Founder',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    content: 'Modern AI Engineering Handbook langsung to the point. Tidak buang waktu pada teori matematika klise, melainkan fokus pada arsitektur RAG, latency optimization, dan evaluasi riil.',
    bookTitle: 'Modern AI Engineering Handbook',
    rating: 5,
  }
];

export const FAQS = [
  {
    question: 'Bagaimana cara mengakses buku panduan setelah pembelian?',
    answer: 'Akses instan! Begitu pembayaran terverifikasi, Anda akan menerima email berisikan tautan unduhan file PDF resolusi tinggi, file ePub untuk e-reader, serta link akses repositori GitHub dan template Notion pendukung.',
  },
  {
    question: 'Apakah saya mendapatkan pembaruan (updates) di masa depan?',
    answer: 'Ya, seluruh guide book di Educare dilengkapi jaminan pembaruan seumur hidup (Lifetime Free Updates). Setiap kali ada pembaruan teknologi, best practice baru, atau perbaikan errata, Anda akan menerima notifikasi dan versi terbaru secara cuma-cuma.',
  },
  {
    question: 'Metode pembayaran apa saja yang didukung?',
    answer: 'Kami mendukung seluruh metode pembayaran populer di Indonesia: QRIS (GoPay, OVO, Dana, ShopeePay), Transfer Bank Otomatis / Virtual Account (BCA, Mandiri, BRI, BNI), serta Kartu Kredit/Debit Visa & MasterCard.',
  },
  {
    question: 'Apakah tersedia garansi uang kembali jika isi buku tidak sesuai ekspektasi?',
    answer: 'Tentu saja! Kami memberikan garansi 100% uang kembali selama 30 hari tanpa syarat rumit jika Anda merasa materi yang disajikan tidak memberikan nilai nyata bagi perkembangan karir Anda.',
  },
  {
    question: 'Bolehkah saya mencetak buku panduan ini untuk penggunaan pribadi?',
    answer: 'Boleh sekali! Setiap file PDF diformat khusus dengan layout print-ready (crop marks & margin standar cetak) sehingga sangat nyaman dicetak sebagai hardcopy pribadi.',
  }
];
