import { Heart, ShoppingCart } from 'lucide-react';
import CartSheet from '../cart/ui/Sheet';
import { CartSheetController } from '../cart/ui/CartSheetController';
import { Button } from '@shared/ui/button';
import { SearchTrigger } from '@features/search';
import { Suspense } from 'react';
import { AccountButton } from '../account/ui/AccoutnButton';
import { Link } from '@shared/i18n/navigation';

export const HeaderOptions = ({ locale }: { locale: string }) => {
  return (
    <div className="col-span-1 flex justify-end gap-1 items-center px-1">
      <SearchTrigger className="h-full hidden md:block" />
      <Button
        variant="ghost"
        size="icon"
        aria-label="Favorites"
        className="hidden md:inline-flex hover:[&>svg]:stroke-[#e31e24]"
        asChild
      >
        <Link href={'/favorites'}>
          <Heart />
        </Link>
      </Button>
      <Suspense
        fallback={
          <Suspense>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Account"
            >
            </Button>
          </Suspense>
        }
      >
        <AccountButton className=" flex " locale={locale} />
      </Suspense>
      <Suspense
        fallback={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Shopping cart"
            className="group"
          >
            <ShoppingCart className="h-4 w-4 group:hover:stroke-white" />
          </Button>
        }
      >
        <CartSheetController locale={locale}>
          <CartSheet locale={locale} />
        </CartSheetController>
      </Suspense>
    </div>
  );
};
