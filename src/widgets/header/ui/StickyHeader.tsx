'use client';

import { useEffect, useRef } from 'react';
import { useScrollStore } from '@shared/store/use-scroll-store';
import { cn } from '@shared/lib/utils';

export function StickyHeader({ children }: { children: React.ReactNode }) {
  const isHeaderVisible = useScrollStore((s) => s.isHeaderVisible);
  const isScrollHideEnabled = useScrollStore((s) => s.isScrollHideEnabled);
  const headerRef = useRef<HTMLElement>(null);

  const hidden = isScrollHideEnabled && !isHeaderVisible;

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () =>
      document.documentElement.style.setProperty('--header-height', `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        'sticky top-0 z-30 bg-background md:h-fit flex flex-col items-center shadow',
        'transition-transform duration-300 ease-in-out will-change-transform',
        hidden ? 'md:-translate-y-full' : 'translate-y-0',
      )}
    >
      {children}
    </header>
  );
}
