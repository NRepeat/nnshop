'use client';

import { useEffect, useRef } from 'react';
import { useScrollStore } from '@shared/store/use-scroll-store';

const HIDE_THRESHOLD = 80; // px from top before hiding kicks in
const SCROLL_DELTA = 8;    // min px scrolled before direction changes

export function ScrollDirectionProvider({ children }: { children: React.ReactNode }) {
  const setHeaderVisible = useScrollStore((s) => s.setHeaderVisible);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY < HIDE_THRESHOLD) {
        setHeaderVisible(true);
      } else if (delta > SCROLL_DELTA) {
        setHeaderVisible(false);
      } else if (delta < -SCROLL_DELTA) {
        setHeaderVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [setHeaderVisible]);

  return <>{children}</>;
}
