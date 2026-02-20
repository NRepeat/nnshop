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
import { useRouter } from '@shared/i18n/navigation';
import { Button } from '@shared/ui/button';
import { saveGenderPreference } from '../api/saveGender';
import { cookieFenderSet } from '../api/setCookieGender';

const NavigationSheet = ({
  meinMenu,
  title,
  locale,
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
  locale: string;
}) => {
  const navigate = useRouter();
  const [open, setOpen] = useState(false);
  const onClose = (link: string) => {
    setOpen(false);
    const genderMatch = link.match(/^\/(woman|man)\//);
    if (genderMatch) {
      const gender = genderMatch[1] as 'woman' | 'man';
      cookieFenderSet(gender);
      saveGenderPreference(gender);
    }
    navigate.push(link);
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="cursor-pointer   justify-center items-center "
        asChild
      >
        <Button variant="ghost" size="icon" aria-label="Open menu" className="rounded-md">
          <Menu className="" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full">
        <SheetHeader className="pt-6 px-4">
          <SheetTitle className="font-sans">{title}</SheetTitle>
        </SheetHeader>
        <InternalMenu meinMenu={meinMenu} onClose={onClose} />
        <SheetFooter className="flex justify-center w-full flex-row mb-20">
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default NavigationSheet;
