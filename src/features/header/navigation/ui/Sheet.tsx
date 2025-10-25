import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shared/ui/sheet';
import { getTranslations } from 'next-intl/server';
import BurgerIcon from './BurgerIcon';
import Link from 'next/link';
import { Separator } from '@shared/ui/separator';

const NavigationSheet = async () => {
  const t = await getTranslations('Header.nav.drawer');
  return (
    <Sheet>
      <SheetTrigger className="cursor-pointer block md:hidden">
        <BurgerIcon className="min-h-6 min-w-6" />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col space-y-2">
          <Link href="/home" className="text-sm py-2">
            {t('home')}
          </Link>
          <Separator />
          <Link href="/collections" className="text-sm py-2">
            {t('collections')}
          </Link>
          <Separator />
          <Link href="/new" className="text-sm py-2">
            {t('new')}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NavigationSheet;
