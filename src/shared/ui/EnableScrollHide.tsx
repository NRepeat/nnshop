'use client';

import { useEffect } from 'react';
import { useScrollStore } from '@shared/store/use-scroll-store';

export function EnableScrollHide() {
  const setScrollHideEnabled = useScrollStore((s) => s.setScrollHideEnabled);
  const setHeaderVisible = useScrollStore((s) => s.setHeaderVisible);

  useEffect(() => {
    setScrollHideEnabled(true);
    return () => {
      setScrollHideEnabled(false);
      setHeaderVisible(true); // restore on leave
    };
  }, [setScrollHideEnabled, setHeaderVisible]);

  return null;
}
