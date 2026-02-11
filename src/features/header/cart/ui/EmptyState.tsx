import { Button } from '@shared/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@shared/ui/empty';
import { SheetContent, SheetHeader, SheetTitle } from '@shared/ui/sheet';
import { ArrowUpRightIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

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
            <Button className="rounded-full">{t('continue_shopping')}</Button>
            {/* <Button variant="outline" className="rounded-full">
              {t('login')}
            </Button> */}
          </div>
          <div className="flex flex-col">
            {/* <Image
              src=""
              alt="Justin Reed"
              width={400}
              height={400}
            /> */}
            {/* <Button
              variant="link"
              asChild
              className="text-muted-foreground"
              size="sm"
            >
              <a href="#">
                {t('new_arrivals')} <ArrowUpRightIcon />
              </a>
            </Button> */}
          </div>
        </EmptyContent>
      </Empty>
    </SheetContent>
  );
}
