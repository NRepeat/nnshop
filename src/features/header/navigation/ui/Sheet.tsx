import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shared/ui/sheet';
import { getTranslations } from 'next-intl/server';
import BurgerIcon from './BurgerIcon';
import { getMainMenu } from '../api/getMainMenu';
import { InternalMenu } from './InternalMenu';

import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';

const NavigationSheet = async () => {
  const t = await getTranslations('Header.nav.drawer');
  const locale = await getLocale();
  const cookie = await cookies();
  const gender = cookie.get('gender')?.value || 'woman';
  const meinMenu = await getMainMenu({ gender, locale });
  return (
    <Sheet>
      <SheetTrigger className="cursor-pointer block md:hidden hover:bg-accent p-2 rounded-lg">
        <BurgerIcon className="min-h-6 min-w-6" />
      </SheetTrigger>
      <SheetContent side="left" className="">
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>
        </SheetHeader>
        <InternalMenu meinMenu={meinMenu} />
      </SheetContent>
    </Sheet>
  );
};

export default NavigationSheet;
