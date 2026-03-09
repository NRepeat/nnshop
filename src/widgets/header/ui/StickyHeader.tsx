'use client';

import { useScrollStore } from '@shared/store/use-scroll-store';
import { cn } from '@shared/lib/utils';

export function StickyHeader({ children }: { children: React.ReactNode }) {
  const isHeaderVisible = useScrollStore((s) => s.isHeaderVisible);
  const isScrollHideEnabled = useScrollStore((s) => s.isScrollHideEnabled);

  const hidden = isScrollHideEnabled && !isHeaderVisible;

  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-background md:h-fit flex flex-col items-center shadow',
        'transition-transform duration-300 ease-in-out will-change-transform',
        hidden ? '-translate-y-full' : 'translate-y-0',
      )}
    >
      {children}
    </header>
  );
}
