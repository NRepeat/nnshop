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
import { Button } from '@shared/ui/button';
import { getMainMenu } from '../api/getMainMenu';
import { InternalMenu } from './InternalMenu';

const NavigationSheet = async () => {
  const t = await getTranslations('Header.nav.drawer');
  const meinMenu = await getMainMenu();
  const menu = meinMenu.map((item) => (
    <Link href={item.url} className="text-sm py-4 px-4 hover:bg-accent">
      {item.title}
    </Link>
  ));
  return (
    <Sheet>
      <SheetTrigger className="cursor-pointer block md:hidden hover:bg-accent p-2 rounded-lg">
        <BurgerIcon className="min-h-6 min-w-6" />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>
        </SheetHeader>
        <InternalMenu meinMenu={meinMenu} />
      </SheetContent>
    </Sheet>
  );
};

export default NavigationSheet;
