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

export async function OrderEmptyState({
  type,
  locale,
}: {
  type: 'notLoggedIn' | 'emptyState';
  locale: string;
}) {
  const t = await getTranslations({
    locale,
    namespace: `OrderPage.${type}`,
  });
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{t('title')}</EmptyTitle>
        <EmptyDescription>{t('description')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {type === 'notLoggedIn' ? (
          <Button asChild>
            <Link href="/auth/sign-in">{t('login')}</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/">{t('continueShopping')}</Link>
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
