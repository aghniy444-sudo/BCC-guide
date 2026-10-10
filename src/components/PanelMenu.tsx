'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import styles from './PanelShell.module.css';

export type NavIcon =
  | 'home'
  | 'orders'
  | 'gift'
  | 'book'
  | 'layers'
  | 'trophy'
  | 'file'
  | 'play'
  | 'tag'
  | 'megaphone'
  | 'upload'
  | 'users'
  | 'catalog'
  | 'search'
  | 'logout'
  | 'panel'
  | 'menu'
  | 'close';

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
  group: string;
  badge?: string;
}

const ICON_PATHS: Record<NavIcon, ReactNode> = {
  home: (
    <>
      <path d="M4 10.6 12 4l8 6.6" />
      <path d="M6.5 9.8V19a1 1 0 0 0 1 1H10v-5h4v5h2.5a1 1 0 0 0 1-1V9.8" />
    </>
  ),
  orders: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  gift: (
    <>
      <path d="M12 7v13" />
      <path d="M4 11h16v9H4z" />
      <path d="M4 7h16v4H4z" />
      <path d="M12 7C12 4.5 9.6 4 8.8 5.4 8.1 6.7 10 7 12 7z" />
      <path d="M12 7c0-2.5 2.4-3 3.2-1.6C15.9 6.7 14 7 12 7z" />
    </>
  ),
  book: (
    <>
      <path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
      <path d="M5 17a3 3 0 0 1 3-3h9" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 5H5v2a3 3 0 0 0 3 3" />
      <path d="M16 5h3v2a3 3 0 0 1-3 3" />
      <path d="M12 13v4" />
      <path d="M9 20h6" />
      <path d="M10 17h4v3h-4z" />
    </>
  ),
  file: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 12h5M9.5 16h5" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m10 9 5 3-5 3z" />
    </>
  ),
  tag: (
    <>
      <path d="M4 4h7l9 9-7 7-9-9z" />
      <circle cx="8.5" cy="8.5" r="1.3" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 10v4h3l7 4V6l-7 4z" />
      <path d="M17 9a3.5 3.5 0 0 1 0 6" />
    </>
  ),
  upload: (
    <>
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
      <path d="M12 3v11" />
      <path d="m8 7 4-4 4 4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6" />
      <path d="M17 20a5.5 5.5 0 0 0-3-4.9" />
    </>
  ),
  catalog: (
    <>
      <path d="M4 9 5.5 4h13L20 9" />
      <path d="M4 9h16v11H4z" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  logout: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="m10 8-4 4 4 4" />
      <path d="M6 12h9" />
    </>
  ),
  panel: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M9 4v16" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
};

function Icon({ name, size = 20 }: { name: NavIcon; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

interface MenuContextValue {
  open: boolean;
  collapsed: boolean;
  toggle: () => void;
  close: () => void;
  toggleCollapse: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  collapseButtonRef: RefObject<HTMLButtonElement | null>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu(): MenuContextValue {
  const value = useContext(MenuContext);
  if (!value) throw new Error('Panel menu digunakan di luar PanelShell.');
  return value;
}

const STORAGE_KEY = 'bcc-panel-collapsed';
const COLLAPSE_EVENT = 'bcc-panel-collapsed-change';

export function PanelMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const collapsed = useSyncExternalStore(
    (onChange) => {
      window.addEventListener('storage', onChange);
      window.addEventListener(COLLAPSE_EVENT, onChange);
      return () => {
        window.removeEventListener('storage', onChange);
        window.removeEventListener(COLLAPSE_EVENT, onChange);
      };
    },
    () => {
      try {
        return window.localStorage.getItem(STORAGE_KEY) === '1';
      } catch {
        return false;
      }
    },
    () => false,
  );
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const collapseButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasOpen = useRef(false);
  const skipClose = useRef(true);
  const pathname = usePathname();

  useEffect(() => {
    if (skipClose.current) {
      skipClose.current = false;
      return;
    }
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open && !wasOpen.current) closeButtonRef.current?.focus();
    if (!open && wasOpen.current) menuButtonRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const content = document.querySelector('[data-panel-content]');
    content?.setAttribute('inert', '');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const root = document.getElementById('panel-nav');
      const focusable = root
        ? [...root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])')]
        : [];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      content?.removeAttribute('inert');
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const value: MenuContextValue = {
    open,
    collapsed,
    toggle: () => setOpen((current) => !current),
    close: () => setOpen(false),
    toggleCollapse: () => {
      try {
        window.localStorage.setItem(STORAGE_KEY, collapsed ? '0' : '1');
      } catch {
        // Ignore persistence failures.
      }
      window.dispatchEvent(new Event(COLLAPSE_EVENT));
    },
    menuButtonRef,
    closeButtonRef,
    collapseButtonRef,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function PanelFrame({
  profile,
  nav,
  homeHref,
  catalogHref,
  children,
}: {
  profile: { email: string | null; role: 'admin' | 'user' };
  nav: NavItem[];
  homeHref: string;
  catalogHref: string;
  children: ReactNode;
}) {
  const { open, collapsed, toggle, close, toggleCollapse, menuButtonRef, closeButtonRef, collapseButtonRef } = useMenu();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const email = profile.email ?? 'akun';
  const roleLabel = profile.role === 'admin' ? 'Admin' : 'Pengguna';
  const initial = email.slice(0, 1).toUpperCase();

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase();
    const visible = term ? nav.filter((item) => item.label.toLowerCase().includes(term)) : nav;
    return visible.reduce<{ group: string; items: NavItem[] }[]>((acc, item) => {
      const last = acc[acc.length - 1];
      if (last && last.group === item.group) last.items.push(item);
      else acc.push({ group: item.group, items: [item] });
      return acc;
    }, []);
  }, [nav, query]);

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.refresh();
  };

  const sidebarClass = [styles.sidebar, open ? styles.sidebarOpen : '', collapsed ? styles.sidebarCollapsed : '']
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {open ? (
        <button type="button" className={styles.backdrop} aria-label="Tutup menu" tabIndex={-1} onClick={close} />
      ) : null}
      <div className={collapsed ? `${styles.shell} ${styles.shellCollapsed}` : styles.shell}>
        <header className={styles.mobileBar}>
          <button
            type="button"
            ref={menuButtonRef}
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="panel-nav"
            aria-label="Buka menu"
            onClick={toggle}
          >
            <Icon name="menu" size={20} />
          </button>
          <Link href={homeHref} className={styles.mobileBrand}>
            BCC Guide
          </Link>
          <span className={styles.roleChip}>{roleLabel}</span>
        </header>

        <aside id="panel-nav" className={sidebarClass} aria-label="Navigasi panel">
          <div className={styles.sideHead}>
            <Link href={homeHref} className={styles.brand} onClick={close}>
              <span className={styles.brandMark} aria-hidden="true">
                <Icon name="panel" size={18} />
              </span>
              <span className={styles.brandText}>BCC Guide</span>
            </Link>
            <button
              type="button"
              ref={collapseButtonRef}
              className={styles.collapseBtn}
              aria-pressed={collapsed}
              aria-label={collapsed ? 'Perluas menu' : 'Ciutkan menu'}
              title={collapsed ? 'Perluas menu' : 'Ciutkan menu'}
              onClick={toggleCollapse}
            >
              <Icon name="panel" size={18} />
            </button>
            <button type="button" ref={closeButtonRef} className={styles.closeBtn} aria-label="Tutup menu" onClick={close}>
              <Icon name="close" size={18} />
            </button>
          </div>

          <label className={styles.search}>
            <Icon name="search" size={17} />
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Cari menu"
              aria-label="Cari menu"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <nav className={styles.nav}>
            {groups.length === 0 ? <p className={styles.noResult}>Tidak ada menu.</p> : null}
            {groups.map(({ group, items }) => (
              <div key={group} className={styles.navGroup}>
                <div className={styles.groupLabel}>{group}</div>
                {items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={active ? styles.navLinkActive : styles.navLink}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                      onClick={close}
                    >
                      <span className={styles.navIcon}>
                        <Icon name={item.icon} />
                      </span>
                      <span className={styles.navLabel}>{item.label}</span>
                      {item.badge ? <span className={styles.navBadge}>{item.badge}</span> : null}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className={styles.sideFoot}>
            <Link
              href={catalogHref}
              className={styles.catalogLink}
              title={collapsed ? 'Kembali ke katalog' : undefined}
              onClick={close}
            >
              <span className={styles.navIcon}>
                <Icon name="catalog" />
              </span>
              <span className={styles.catalogText}>Kembali ke katalog</span>
            </Link>
            <div className={styles.identityCard}>
              <span className={styles.avatar} aria-hidden="true">
                {initial}
              </span>
              <span className={styles.identityText}>
                <span className={styles.identityEmail}>{email}</span>
                <span className={styles.identityRole}>{roleLabel}</span>
              </span>
              <button
                type="button"
                className={styles.logoutBtn}
                aria-label="Keluar"
                title="Keluar"
                onClick={handleLogout}
              >
                <Icon name="logout" size={18} />
              </button>
            </div>
          </div>
        </aside>

        <main className={styles.content} data-panel-content>
          {children}
        </main>
      </div>
    </>
  );
}
