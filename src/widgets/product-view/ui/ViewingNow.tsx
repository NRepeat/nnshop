'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ViewingNow({ handle }: { handle: string }) {
  const t = useTranslations('ProductPage');
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/viewers?handle=${encodeURIComponent(handle)}`);
        const data = await res.json();
        if (!cancelled && data.count >= 2) setCount(data.count);
      } catch {
        // no viewers data — don't show anything
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
