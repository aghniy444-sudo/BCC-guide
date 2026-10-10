'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Reveal.module.css';

type RevealVariant = 'up' | 'left' | 'right' | 'zoom' | 'blur' | 'rotate';

const VARIANT_CLASS: Record<RevealVariant, string> = {
  up: styles.up,
  left: styles.left,
  right: styles.right,
  zoom: styles.zoom,
  blur: styles.blur,
  rotate: styles.rotate,
};

/**
 * Plays an entrance animation the first time its children reach the viewport.
 * The reveal state is written to a data attribute so no React state is needed.
 *
 * The animation runs for every visitor on purpose: it is decorative and was
 * requested explicitly, so it is not disabled under `prefers-reduced-motion`.
 */
export default function Reveal({
  children,
  variant = 'up',
  delay = 0,
  className,
}: {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      node.dataset.reveal = 'shown';
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          node.dataset.reveal = 'shown';
          observer.disconnect();
        }
      },
      // A low threshold plus a small negative bottom margin so tall sections
      // (which can never cover the whole viewport) still trigger reliably.
      { threshold: 0, rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[styles.reveal, VARIANT_CLASS[variant], className].filter(Boolean).join(' ')}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
