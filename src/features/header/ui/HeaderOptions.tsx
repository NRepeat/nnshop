import { Heart, ShoppingCart } from 'lucide-react';
import CartSheet from '../cart/ui/Sheet';
import { Button } from '@shared/ui/button';
import { SearchSession } from '../search/ui/search-session';
import { Suspense } from 'react';
import { AccountButton } from '../account/ui/AccoutnButton';
import { Link } from '@shared/i18n/navigation';

export const HeaderOptions = ({ locale }: { locale: string }) => {
  return (
    <div className="col-span-1 flex justify-end gap-1 items-center px-1">
      <SearchSession className="h-full hidden md:block" />
      <Link href={'/favorites'} className="hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          className="group hover:[&>svg]:stroke-[#e31e24]"
        >
          <Heart />
        </Button>
      </Link>
      <Suspense>
        <AccountButton className=" flex " locale={locale} />
      </Suspense>
      <Suspense
        fallback={
          <Button variant="ghost" size="icon" className="group">
            <ShoppingCart className="h-4 w-4 group:hover:stroke-white" />
          </Button>
        }
      >
        <CartSheet locale={locale} />
      </Suspense>
    </div>
  );
};
