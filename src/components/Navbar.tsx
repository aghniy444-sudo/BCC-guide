'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLenis } from 'lenis/react';
import styles from './Navbar.module.css';
import { createClient } from '@/lib/supabase/browser';

interface NavbarProps {
  user: { email: string; role: 'admin' | 'user' } | null;
  onOpenSearch: () => void;
  onOpenLogin: () => void;
  onOpenCart: () => void;
  cartCount: number;
}

const NAV_LINKS = [
  { name: 'Home', href: '#hero', id: 'hero' },
  { name: 'Guides', href: '#catalog', id: 'catalog' },
  { name: 'Mentors', href: '#mentors', id: 'mentors' },
  { name: 'About Us', href: '#about', id: 'about' },
  { name: 'Contact', href: '#contact', id: 'contact' },
];

export default function Navbar({
  user,
  onOpenSearch,
  onOpenLogin,
  onOpenCart,
  cartCount,
}: NavbarProps) {
  const router = useRouter();
  const lenis = useLenis();
  const [activeTab, setActiveTab] = useState('Home');

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const centerPillRef = useRef<HTMLElement | null>(null);
  const navIndicatorRef = useRef<HTMLSpanElement | null>(null);
  const indicatorReady = useRef(false);

  // Dynamic ScrollSpy and Scrolled State Detection
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const windowHeight = window.innerHeight;
          const docHeight = document.documentElement.scrollHeight;

          // Check if scrolled near the bottom of document -> highlight Contact/Footer
          if (scrollY + windowHeight >= docHeight - 90) {
            setActiveTab('Contact');
            ticking = false;
            return;
          }

          // Evaluate sections top position relative to viewport
          const navOffset = 130;
          let currentSection = 'Home';

          for (const link of NAV_LINKS) {
            const el = document.getElementById(link.id);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= navOffset) {
                currentSection = link.name;
              }
            }
          }

          setActiveTab(currentSection);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 868) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Slide the white highlight to the active item instead of hard-swapping a
  // class, so moving between sections animates rather than jumping.
  useLayoutEffect(() => {
    const updateIndicator = () => {
      const container = centerPillRef.current;
      const indicator = navIndicatorRef.current;
      if (!container || !indicator) return;
      const active = container.querySelector<HTMLElement>('[data-active="true"]');
      if (!active) {
        indicator.style.opacity = '0';
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      if (rect.width === 0) return;
      if (!indicatorReady.current) {
        // Skip the transition on the very first placement so the pill does not
        // fly in from the left corner on load.
        indicator.style.transition = 'none';
      }
      indicator.style.width = `${rect.width}px`;
      indicator.style.transform = `translateX(${rect.left - containerRect.left - container.clientLeft}px)`;
      indicator.style.opacity = '1';
      if (!indicatorReady.current) {
        void indicator.offsetWidth;
        indicator.style.transition = '';
        indicatorReady.current = true;
      }
    };
    updateIndicator();
    const container = centerPillRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeTab]);

  const handleNavClick = (name: string, href: string) => {
    setActiveTab(name);
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (!element) return;
    if (lenis) lenis.scrollTo(element);
    else element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={styles.headerWrapper}>
      {/* Dimmed glass overlay behind mobile menu drawer */}
      {mobileMenuOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={styles.navContainer}>
        {/* Brand Logo — BG monogram */}
        <div 
          className={styles.brand} 
          onClick={() => handleNavClick('Home', '#hero')}
          role="button"
          tabIndex={0}
        >
          <Image
            src="/bg-logo.png"
            alt=""
            aria-hidden="true"
            width={526}
            height={379}
            className={styles.brandIcon}
            priority
          />
          <span className={styles.brandText}>BCC Guide</span>
        </div>

        {/* Center Pill Navigation Capsule (Desktop Glassmorphism - Reference Photo 2) */}
        <nav className={styles.centerPill} aria-label="Main Navigation" ref={centerPillRef}>
          <span className={styles.navIndicator} ref={navIndicatorRef} aria-hidden="true" />
          {NAV_LINKS.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.name, item.href);
                }}
                className={styles.navItem}
                data-active={isActive ? 'true' : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* Right Actions: Desktop Glass Buttons + Mobile Hamburger (Reference Photo 3) */}
        <div className={styles.rightActions}>
          {/* Desktop Search Circular Button */}
          <button
            type="button"
            className={styles.searchBtn}
            onClick={onOpenSearch}
            aria-label="Cari produk"
            title="Cari produk"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Desktop Cart Circular Button */}
          <button
            type="button"
            className={styles.cartBtn}
            onClick={onOpenCart}
            aria-label={`Keranjang Belanja (${cartCount} item)`}
            title="Shopping Cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-2z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </button>

          {/* Desktop Account Controls */}
          {user ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link
                href={user.role === 'admin' ? '/admin' : '/dashboard'}
                className={styles.loginBtn}
                aria-label="Buka dashboard"
              >
                <div className={styles.loginAvatarCircle} aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <span className={styles.loginText}>
                  {user.role === 'admin' ? 'Admin' : 'Dashboard'}
                </span>
              </Link>
              <button
                type="button"
                className={styles.loginBtn}
                onClick={handleLogout}
                aria-label="Keluar"
              >
                <span className={styles.loginText}>Keluar</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.loginBtn}
              onClick={onOpenLogin}
              aria-label="Login atau Akun"
            >
              <div className={styles.loginAvatarCircle} aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <span className={styles.loginText}>Login</span>
            </button>
          )}

          {/* Mobile Cart Quick Icon (shows when cart has items) */}
          {cartCount > 0 && (
            <button
              type="button"
              className={styles.mobileQuickCartBtn}
              onClick={onOpenCart}
              aria-label={`Keranjang Belanja (${cartCount} item)`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-2z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className={styles.mobileCartDot}>{cartCount}</span>
            </button>
          )}

          {/* Mobile Menu Hamburger Button (Reference Photo 3 rounded pill style) */}
          <button
            type="button"
            className={`${styles.mobileMenuBtn} ${mobileMenuOpen ? styles.mobileMenuBtnActive : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Floating Drawer (Reference Photo 3 Glass Dropdown) */}
      {mobileMenuOpen && (
        <div className={styles.mobileDrawerWrapper}>
          <nav className={styles.mobileDrawer} aria-label="Mobile Navigation">
            {/* Quick Actions Row */}
            <div className={styles.mobileActionsRow}>
              <button
                type="button"
                className={styles.mobileActionBtn}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearch();
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Cari</span>
              </button>

              <button
                type="button"
                className={styles.mobileActionBtn}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCart();
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-2z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>Keranjang ({cartCount})</span>
              </button>

              {user ? (
                <>
                  <Link
                    href={user.role === 'admin' ? '/admin' : '/dashboard'}
                    className={styles.mobileLoginPill}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <span>{user.role === 'admin' ? 'Admin' : 'Dashboard'}</span>
                  </Link>
                  <button
                    type="button"
                    className={styles.mobileLoginPill}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <span>Keluar</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={styles.mobileLoginPill}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <span>Login</span>
                </button>
              )}
            </div>

            <div className={styles.mobileDivider} />

            {/* Navigation Links with Active Spy Pill */}
            <div className={styles.mobileNavLinksList}>
              {NAV_LINKS.map((item) => {
                const isActive = activeTab === item.name;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.name, item.href);
                    }}
                    className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavItemActive : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span>{item.name}</span>
                    {isActive && (
                      <span className={styles.activeDot} />
                    )}
                  </a>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
