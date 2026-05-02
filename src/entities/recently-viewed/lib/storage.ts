/**
 * Client-side recently-viewed storage. Replaces DB-backed tracking that was
 * driving anonymous Better Auth sign-ins + per-view upserts.
 */

const KEY = 'mm_recently_viewed_v1';
const MAX = 20;

type Entry = {
  productId: string;
  handle: string;
  viewedAt: number;
};

function safeRead(): Entry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(entries: Entry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // quota / private mode — ignore
  }
}

export function recordView(productId: string, handle: string) {
  if (!productId || !handle) return;
  const now = Date.now();
  const list = safeRead().filter((e) => e.productId !== productId);
  list.unshift({ productId, handle, viewedAt: now });
  if (list.length > MAX) list.length = MAX;
  safeWrite(list);
}

export function getRecentHandles(limit = 10): string[] {
  return safeRead().slice(0, limit).map((e) => e.handle);
}

export function clearRecent() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
}
