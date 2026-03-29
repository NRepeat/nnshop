import { Button } from '@shared/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@shared/ui/empty';
import { SheetContent, SheetHeader, SheetTitle } from '@shared/ui/sheet';
import { getTranslations } from 'next-intl/server';
import { Link } from '@shared/i18n/navigation';

export async function EmptyState({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: 'Header.cart.drawer.empty_state',
  });
  return (
    <SheetContent>
      <SheetHeader className="sticky top-0">
        <SheetTitle>{''}</SheetTitle>
      </SheetHeader>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t('header')}</EmptyTitle>
          <EmptyDescription>{t('description')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button className="rounded" variant={'default'} asChild>
              <Link className="w-full" href="/">
                {t('continue_shopping')}
              </Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </SheetContent>
  );
}
