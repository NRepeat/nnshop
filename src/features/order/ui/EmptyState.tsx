import { Button } from '@shared/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@shared/ui/empty';
import { getTranslations } from 'next-intl/server';
import { Link } from '@shared/i18n/navigation';

export async function OrderEmptyState({
  type,
}: {
  type: 'notLoggedIn' | 'emptyState';
}) {
  const t = await getTranslations(`OrderPage.${type}`);
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
