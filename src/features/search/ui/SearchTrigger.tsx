'use client';
import { useState, useEffect } from 'react';
import { Button } from '@shared/ui/button';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SearchCommandDialog } from './SearchCommandDialog';

export function SearchTrigger({ className }: { className?: string }) {
  const t = useTranslations('Search');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <Button
        className={className}
        variant="ghost"
        size="icon"
        aria-label={t('title')}
        onClick={() => setOpen(true)}
      >
        <Search className="w-5 h-5" />
      </Button>
      <SearchCommandDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
