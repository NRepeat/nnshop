'use client';
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const PREFIX = 'nnshop:scroll:';
const SAVE_THROTTLE_MS = 200;
const RESTORE_DEADLINE_MS = 1500;

/**
 * Persist window scroll position per pathname+search across client navigations.
 *
 * App Router's built-in scroll restoration is unreliable when a page is fully
 * dynamic (uses searchParams + cacheComponents): on back-nav the page re-fetches
 * server-side, the DOM is empty for a tick, the browser's scroll target is
 * past the new (empty) content height, and the browser snaps to top.
 *
 * Strategy:
 *   - Save scrollY (throttled) to sessionStorage keyed by pathname+search.
 *   - On mount, restore scrollY by retrying inside requestAnimationFrame until
 *     the document is tall enough to seat the saved position OR a deadline
 *     elapses (1.5s). This handles late-mounting children (favorites fetch,
 *     LoadMore initial limit hydration, image height settling).
 *   - On forward navigation to a new key, the previous key's scroll value
 *     stays in sessionStorage, so back-nav from /product → /search restores.
 */
export function useScrollMemory() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const key = `${PREFIX}${pathname}?${search}`;

  // Track latest key in a ref so the scroll listener (mounted once) writes
  // to the current key, not a stale one captured at mount.
  const keyRef = useRef(key);
  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  // Restore on mount / key change.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem(key);
    if (!raw) return;
    const target = parseInt(raw, 10);
    if (Number.isNaN(target) || target <= 0) return;

    const start = performance.now();
    let rafId: number;
    const tryRestore = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max >= target - 4) {
        window.scrollTo({ top: target, behavior: 'instant' as ScrollBehavior });
        return;
      }
      if (performance.now() - start > RESTORE_DEADLINE_MS) return;
      rafId = requestAnimationFrame(tryRestore);
    };
    rafId = requestAnimationFrame(tryRestore);
    return () => cancelAnimationFrame(rafId);
  }, [key]);

  // Save on scroll (throttled).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let lastSave = 0;
    let pending: number | null = null;
    const flush = () => {
      pending = null;
      sessionStorage.setItem(keyRef.current, String(window.scrollY));
      lastSave = performance.now();
    };
    const onScroll = () => {
      const now = performance.now();
      if (now - lastSave >= SAVE_THROTTLE_MS) {
        flush();
      } else if (pending == null) {
        pending = window.setTimeout(flush, SAVE_THROTTLE_MS);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (pending != null) window.clearTimeout(pending);
      // Final save on unmount so navigating away captures the latest position.
      sessionStorage.setItem(keyRef.current, String(window.scrollY));
    };
  }, []);
}
