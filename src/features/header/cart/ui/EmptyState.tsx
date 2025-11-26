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

export async function EmptyState() {
  const t = await getTranslations('Header.cart.drawer.empty_state');
  return (
    <SheetContent>
      <SheetHeader className="sticky top-0">
        <SheetTitle>{''}</SheetTitle>
      </SheetHeader>
      <Empty>
        <EmptyHeader>
          {/*<EmptyMedia variant="icon">
            <IconFolderCode />
          </EmptyMedia>*/}
          <EmptyTitle>{t('header')}</EmptyTitle>
          <EmptyDescription>{t('description')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button className="rounded-full">{t('continue_shopping')}</Button>
            <Button variant="outline" className="rounded-full">
              {t('login')}
            </Button>
          </div>
          <div className="flex flex-col">
            <Image
              src="https://justinreed.com/cdn/shop/collections/newbanner_f76641fa-b78e-4159-823c-8ae34cb9c165.jpg?v=1745522913&width=1500"
              alt="Justin Reed"
              width={400}
              height={400}
            />
            <Button
              variant="link"
              asChild
              className="text-muted-foreground"
              size="sm"
            >
              <a href="#">
                {t('new_arrivals')} <ArrowUpRightIcon />
              </a>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </SheetContent>
  );
}
