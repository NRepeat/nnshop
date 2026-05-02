'use client';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'nnshop:search:recent';
const MAX = 5;

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed
          .filter((v): v is string => typeof v === 'string')
          .slice(0, MAX)
      : [];
  } catch {
    return [];
  }
}

function write(values: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(values));
  } catch {
    /* swallow */
  }
}

export function useRecentSearches() {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    setRecents(read());
  }, []);

  const addRecent = useCallback((raw: string) => {
    const q = raw.trim();
    if (!q) return;
    setRecents((curr) => {
      const next = [
        q,
        ...curr.filter((v) => v.toLowerCase() !== q.toLowerCase()),
      ].slice(0, MAX);
      write(next);
      return next;
    });
  }, []);

  const removeRecent = useCallback((q: string) => {
    setRecents((curr) => {
      const next = curr.filter((v) => v !== q);
      write(next);
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(KEY);
      } catch {
        /* swallow */
      }
    }
    setRecents([]);
  }, []);

  return { recents, addRecent, removeRecent, clearRecents };
}
