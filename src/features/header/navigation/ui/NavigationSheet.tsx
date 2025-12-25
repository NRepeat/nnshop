'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shared/ui/sheet';
import { InternalMenu } from './InternalMenu';
import { useState } from 'react';
import { Maybe } from '@shared/lib/shopify/types/storefront.types';
import { Menu } from 'lucide-react';

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
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="cursor-pointer h-full  justify-center items-center hover:underline hover:text-accent-foreground  rounded-none relative size-9 hover:bg-muted flex md:hidden">
        <Menu className="max-w-5 max-h-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-full">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <InternalMenu meinMenu={meinMenu} onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

export default NavigationSheet;
