import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shared/ui/sheet';
import { getTranslations } from 'next-intl/server';
import CartIcon from '@shared/assets/CartIcon';

const CartSheet = async () => {
  const t = await getTranslations('Header.cart.drawer');
  return (
    <Sheet>
      <SheetTrigger className="cursor-pointer block">
        <CartIcon className="h-10 w-10" />
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
