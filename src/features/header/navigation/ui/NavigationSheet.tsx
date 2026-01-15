'use client';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shared/ui/sheet';
import { InternalMenu } from './InternalMenu';
import { useState } from 'react';
import { Maybe } from '@shared/lib/shopify/types/storefront.types';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { LanguageSwitcher } from '@features/header/language-switcher/ui/LanguageSwitcher';
import { Button } from '@shared/ui/button';
import { useTranslations } from 'next-intl';

const NavigationSheet = ({
  meinMenu,
  title,
}: {
  meinMenu: {
    label: string;
    menu: {
      id: Maybe<string> | undefined;
      title: string;
      url: string;
      items: {
        id: Maybe<string> | undefined;
        title: string;
        url: string;
        items: {
          id: Maybe<string> | undefined;
          title: string;
          url: string;
        }[];
      }[];
    }[];
  }[];
  title: string;
}) => {
  const navigate = useRouter();
  const t = useTranslations('NavigationSheet');
  const [open, setOpen] = useState(false);
  const onClose = (link: string) => {
    setOpen(false);
    navigate.push(link);
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="cursor-pointer   justify-center items-center "
        asChild
      >
        <Button variant="ghost" size="icon" className="rounded-none">
          <Menu className="" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full">
        <SheetHeader className="pt-6 px-4">
          <SheetTitle className="font-sans">{title}</SheetTitle>
        </SheetHeader>
        <InternalMenu meinMenu={meinMenu} onClose={onClose} />
        <SheetFooter className="flex justify-between w-full flex-row">
          <Link
            href={'/account'}
            className="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md text-left transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180 pl-4 py-2.5 text-sm font-normal hover:underline"
          >
            {t('accoutn')}
          </Link>

          <LanguageSwitcher align="end" />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default NavigationSheet;
