'use client';
import { SearchIcon } from 'lucide-react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@shared/ui/empty';
import { useTranslations } from 'next-intl';

export function SearchEmpty() {
  const t = useTranslations('Search');
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchIcon />
        </EmptyMedia>
        <EmptyTitle>{t('noResults')}</EmptyTitle>
        <EmptyDescription>{t('tryAgain')}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
