import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shared/ui/sheet';
import { getTranslations } from 'next-intl/server';
import CartIcon from '@shared/assets/CartIcon';
import { Button } from '@shared/ui/button';
import { ShoppingCart } from 'lucide-react';

const CartSheet = async () => {
  const t = await getTranslations('Header.cart.drawer');
  return (
    <Sheet>
      <SheetTrigger className="cursor-pointer block">
        <Button
          variant="ghost"
          className="h-7.5 w-7.5 p-0 ring-5 ring-black rounded-full"
        >
          <ShoppingCart className="h-7 w-7" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span>{t('empty')}</span>
            <button className="btn btn-primary">{t('checkout')}</button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
