'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      const isModalRoute = pathname.includes('/auth/') || pathname.includes('/quick/');
      if (!isModalRoute) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      prevPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  return null;
}
