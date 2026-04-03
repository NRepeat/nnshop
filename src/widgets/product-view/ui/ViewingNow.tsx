'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';

const STORAGE_KEY = 'viewing_now_session';
const MAX_FALLBACK_VIEWS = 5;
const RESET_HOURS = 24;

type ViewingSession = {
  handles: Record<string, number>; // handle → visit count
  order: string[]; // insertion order for fallback threshold
  startedAt: number;
};

function getSession(): ViewingSession {
  if (typeof window === 'undefined') return { handles: {}, order: [], startedAt: Date.now() };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { handles: {}, order: [], startedAt: Date.now() };
    const parsed = JSON.parse(raw);
    if (Date.now() - (parsed.startedAt || 0) > RESET_HOURS * 60 * 60 * 1000) {
      return { handles: {}, order: [], startedAt: Date.now() };
    }
    // Migrate old format
    if (!parsed.order) {
      const oldHandles: string[] = parsed.viewedHandles || [];
      return {
        handles: Object.fromEntries(oldHandles.map((h: string) => [h, 1])),
        order: oldHandles,
        startedAt: parsed.startedAt || Date.now(),
      };
    }
    return { handles: parsed.handles || {}, order: parsed.order, startedAt: parsed.startedAt };
  } catch {
    return { handles: {}, order: [], startedAt: Date.now() };
  }
}

function trackView(handle: string): ViewingSession {
  const session = getSession();
  if (!session.order.includes(handle)) {
    session.order.push(handle);
  }
  session.handles[handle] = (session.handles[handle] || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

function getFallbackCount(handle: string, visits: number): number {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = ((hash << 5) - hash + handle.charCodeAt(i)) | 0;
  }
  const base = 2 + (Math.abs(hash) % 6); // 2-7
  // Shift by ±1 on each revisit based on visit parity
  const shift = visits % 2 === 0 ? 1 : -1;
  const offset = Math.floor((visits - 1) / 2) % 3; // cycles 0,1,2
  const result = base + shift + offset;
  return Math.max(2, Math.min(9, result));
}

export function ViewingNow({ handle }: { handle: string }) {
  const t = useTranslations('ProductPage');
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const session = trackView(handle);
    const handleIndex = session.order.indexOf(handle);
    const useFallback = handleIndex !== -1 && handleIndex < MAX_FALLBACK_VIEWS;
    const visits = session.handles[handle] || 1;

    (async () => {
      try {
        const res = await fetch(`/api/viewers?handle=${encodeURIComponent(handle)}`);
        const data = await res.json();
        if (!cancelled) {
          if (data.count > 0) {
            setCount(data.count);
          } else if (useFallback) {
            setCount(getFallbackCount(handle, visits));
          }
        }
      } catch {
        if (!cancelled && useFallback) setCount(getFallbackCount(handle, visits));
      }
    })();
    return () => { cancelled = true; };
  }, [handle]);

  if (!count) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground animate-in fade-in duration-500">
      <Eye className="w-3.5 h-3.5" />
      <span>
        {count} {t('viewingNow')}
      </span>
    </div>
  );
}
