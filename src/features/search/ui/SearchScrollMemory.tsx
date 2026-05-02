'use client';
import { useEffect } from 'react';
import { useScrollMemory } from '../lib/use-scroll-memory';

/**
 * Page-level mount point for scroll memory. Lives OUTSIDE the Suspense
 * boundary that wraps SearchPageContent so it activates during the
 * streaming-loading state — not after real products mount.
 *
 * Also disables the browser's native scroll restoration on the document,
 * because:
 *   - PPR streams the skeleton fallback first (~1000px tall).
 *   - Browser restores scroll to saved position (e.g. 8000px) → clamped
 *     to the skeleton's max scroll (~200px) → snaps to bottom of skeleton.
 *   - Real products stream in afterwards, page grows to 12000px, but
 *     scroll has already settled at the wrong spot.
 *
 * With manual restoration, only useScrollMemory's rAF-retry loop runs,
 * which waits until the real content's scrollHeight reaches the saved
 * target before scrolling.
 */
export function SearchScrollMemory() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prev = window.history.scrollRestoration;
    try {
      window.history.scrollRestoration = 'manual';
    } catch {
      // Some embedded contexts disallow assignment — fall back silently.
    }
    return () => {
      try {
        window.history.scrollRestoration = prev;
      } catch {}
    };
  }, []);

  useScrollMemory();

  return null;
}
