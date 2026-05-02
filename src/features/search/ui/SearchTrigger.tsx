'use client';
import { useState } from 'react';
import { Button } from '@shared/ui/button';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SearchDialog } from './SearchDialog';

export function SearchTrigger({ className }: { className?: string }) {
  const t = useTranslations('Search');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className={className}
        variant="ghost"
        size="icon"
        aria-label={t('title')}
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-5 h-5" />
      </Button>
      <SearchDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
