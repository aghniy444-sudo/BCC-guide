'use client';

import { useEffect } from 'react';

/**
 * Counts one landing-page visit per browser session. Rendered only on the
 * storefront so panel pages do not inflate the counter.
 */
export default function VisitTracker() {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem('bcc-visited')) return;
      window.sessionStorage.setItem('bcc-visited', '1');
    } catch {
      // Storage blocked (private mode): count the visit anyway.
    }
    fetch('/api/track', { method: 'POST', keepalive: true }).catch(() => {
      // Tracking is best-effort; never surface an error to the visitor.
    });
  }, []);

  return null;
}
