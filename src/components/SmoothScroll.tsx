'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, type ReactNode } from 'react';

/**
 * Root smooth-scroll provider (Lenis) for the storefront.
 *
 * Configures inertia scrolling for the window. In-page anchors are routed
 * through a single delegated click handler so that `#hero` / `#catalog` /
 * `#mentors` / `#about` / `#contact` links (navbar, footer, newsletter) glide
 * instead of jumping. Smoothing is disabled automatically for users who
 * request reduced motion.
 */
export function SmoothScroll({ children, locked = false }: { children: ReactNode; locked?: boolean }) {
  return (
    <ReactLenis
      root
      options={{
        // Anchors are handled by AnchorScroll below so native and Lenis
        // scrolling never fight over the same click.
        anchors: false,
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      }}
    >
      <AnchorScroll />
      <SmoothScrollLock locked={locked} />
      {children}
    </ReactLenis>
  );
}

/** Delegated click handler: routes same-page hash links through Lenis. */
function AnchorScroll() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [lenis]);

  return null;
}

/**
 * Pauses Lenis while a modal or drawer is open. Those overlays lock
 * `body { overflow: hidden }` themselves, so without this Lenis would keep
 * animating a page that can no longer scroll.
 */
function SmoothScrollLock({ locked }: { locked: boolean }) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    if (locked) lenis.stop();
    else lenis.start();
  }, [lenis, locked]);

  return null;
}
