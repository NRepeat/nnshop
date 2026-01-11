import { Heart, ShoppingCart } from 'lucide-react';
import CartSheet from '../cart/ui/Sheet';
import { Button } from '@shared/ui/button';
import { SearchSession } from '../search/ui/search-session';
import { Suspense } from 'react';
import { AccountButton } from '../account/ui/AccoutnButton';

export const HeaderOptions = ({ locale }: { locale: string }) => {
  return (
    <div className="col-span-1 flex justify-end gap-1 items-center px-1">
      <SearchSession />
      <Button variant="ghost" size="icon" className=" ">
        <Heart />
      </Button>
      <AccountButton className="hidden md:flex " locale={locale} />
      <Suspense
        fallback={
          <Button variant="ghost" size="icon" className="">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        }
      >
        <CartSheet locale={locale} />
      </Suspense>
    </div>
  );
};
