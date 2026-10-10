import Link from 'next/link';
import type { Asset, OrderStatus, Post } from '@/lib/types';
import styles from './PanelContent.module.css';

export function PageHeader({ crumb, title, lede }: { crumb: string; title: string; lede?: string }) {
  return (
    <header className={styles.pageHeader}>
      <p className={styles.crumb}>{crumb}</p>
      <h1 className={styles.title}>{title}</h1>
      {lede ? <p className={styles.lede}>{lede}</p> : null}
    </header>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className={styles.errorBanner} role="alert">
      {message}
    </div>
  );
}

export function QueryError() {
  return (
    <div className={styles.errorBanner} role="alert">
      Gagal memuat data. Muat ulang halaman untuk mencoba lagi.
    </div>
  );
}

export function Empty({
  text,
  hint,
  href,
  action,
}: {
  text: string;
  hint?: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className={styles.empty}>
      <p>{text}</p>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
      {href && action ? (
        <Link href={href} className={styles.linkButton}>
          {action}
        </Link>
      ) : null}
    </div>
  );
}

export function Locked({ text }: { text: string }) {
  return (
    <div className={styles.locked}>
      <p>{text}</p>
      <Link href="/#catalog" className={styles.linkButton}>
        Lihat paket
      </Link>
    </div>
  );
}

export function AssetList({ assets }: { assets: Pick<Asset, 'id' | 'title' | 'is_sample'>[] }) {
  return (
    <ul className={styles.list}>
      {assets.map((asset) => (
        <li key={asset.id} className={styles.row}>
          <span className={styles.rowLabel}>
            {asset.title}
            {asset.is_sample ? <span className={styles.sample}>CONTOH</span> : null}
          </span>
          <a className={styles.linkButton} href={`/api/assets/${asset.id}`}>
            Unduh
          </a>
        </li>
      ))}
    </ul>
  );
}

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul className={styles.list}>
      {posts.map((post) => (
        <li key={post.id} className={styles.post}>
          <strong className={styles.postTitle}>{post.title}</strong>
          {post.body ? <p className={styles.postBody}>{post.body}</p> : null}
          {post.url ? (
            <a className={styles.externalLink} href={post.url} target="_blank" rel="noopener noreferrer">
              {post.url}
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: styles.status_pending,
  paid: styles.status_paid,
  expired: styles.status_expired,
  failed: styles.status_failed,
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`${styles.status} ${STATUS_CLASS[status]}`}>{status}</span>;
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'positive' | 'warning';
}) {
  const toneClass =
    tone === 'positive' ? styles.statPositive : tone === 'warning' ? styles.statWarning : '';
  return (
    <div className={`${styles.statCard} ${toneClass}`}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
      {hint ? <span className={styles.statHint}>{hint}</span> : null}
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.statGrid}>{children}</div>;
}

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.cardGrid}>{children}</div>;
}

export function ShortcutGrid({ items }: { items: { href: string; label: string; text: string }[] }) {
  return (
    <ul className={styles.shortcuts}>
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={styles.shortcut}>
            <span className={styles.shortcutLabel}>{item.label}</span>
            <span className={styles.shortcutText}>{item.text}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
