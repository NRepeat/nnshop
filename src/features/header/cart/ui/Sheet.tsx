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
      <SheetTrigger className="cursor-pointer block hover:bg-accent p-2 rounded-sm">
        <ShoppingCart />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-2 px-4">
          <div className="flex justify-between">
            <span>Product</span>
          </div>
          {/*<div className="flex items-center justify-between">
            <span>{t('empty')}</span>
            <button className="btn btn-primary">{t('checkout')}</button>
          </div>*/}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
