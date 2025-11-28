import { Button } from '@shared/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@shared/ui/empty';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function OrderEmptyState() {
  const t = await getTranslations('OrderPage.emptyState');
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{t('title')}</EmptyTitle>
        <EmptyDescription>{t('description')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/auth/sign-in">{t('login')}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
