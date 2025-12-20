'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shared/ui/sheet';
import BurgerIcon from './BurgerIcon';
import { InternalMenu } from './InternalMenu';
import { useState } from 'react';
import { Maybe } from '@shared/lib/shopify/types/storefront.types';

const NavigationSheet = ({
  meinMenu,
  gender,
  title,
}: {
  meinMenu: {
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
  }[][];
  gender: string;
  title: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="cursor-pointer block md:hidden hover:bg-accent p-2 rounded-lg">
        <BurgerIcon className="min-h-6 min-w-6" />
      </SheetTrigger>
      <SheetContent side="left" className="w-full">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <InternalMenu
          meinMenu={meinMenu}
          currentGender={gender}
          onClose={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
};

export default NavigationSheet;
