'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      prevPathname.current = pathname;
    }
  }, [pathname]);

  return null;
}
