'use client';

import { useEffect } from 'react';
import { usePathStore } from '@/shared/store/use-path-store';

export function PathSync({ paths }: { paths: Record<string, string> }) {
  const setAlternatePaths = usePathStore((state) => state.setAlternatePaths);

  useEffect(() => {
    setAlternatePaths(paths);
    // Очищаем стор при уходе со страницы, чтобы на других страницах
    // не использовались старые пути
    return () => setAlternatePaths(null);
  }, [paths, setAlternatePaths]);

  return null;
}
