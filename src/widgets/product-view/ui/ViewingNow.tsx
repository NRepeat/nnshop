'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';

function getFallback(handle: string): number {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = (hash << 5) - hash + handle.charCodeAt(i);
    hash |= 0;
  }
  return 2 + Math.abs(hash % 6);
}

export function ViewingNow({ handle }: { handle: string }) {
  const t = useTranslations('ProductPage');
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = `/api/viewers?handle=${encodeURIComponent(handle)}`;
        console.log('[ViewingNow] fetching:', url);
        const res = await fetch(url);
        console.log('[ViewingNow] response status:', res.status);
        const data = await res.json();
        console.log('[ViewingNow] data:', data);
        if (!cancelled && data.count >= 2) setCount(data.count);
        else if (!cancelled) {
          // fallback
          const fb = getFallback(handle);
          console.log('[ViewingNow] using fallback:', fb);
          setCount(fb);
        }
      } catch (err) {
        console.error('[ViewingNow] error:', err);
        if (cancelled) return;
        setCount(getFallback(handle));
      }
    })();
    return () => { cancelled = true; };
  }, [handle]);

  if (!count) {
    console.log('[ViewingNow] count is 0, not rendering');
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground animate-in fade-in duration-500">
      <Eye className="w-3.5 h-3.5" />
      <span>
        {count} {t('viewingNow')}
      </span>
    </div>
  );
}
