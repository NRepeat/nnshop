'use client';

import { Card, CardContent } from '@shared/ui/card';
import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import { RemoveItemButton } from '@features/header/cart/ui/RemoveItemButton';
import getSymbolFromCurrency from 'currency-symbol-map';
import { cn } from '@shared/lib/utils';
import { useTranslations } from 'next-intl';

type CartItemProps = {
  product: {
    title: string;
    totalPrice: string;
    quantity: number;
    price: string;
    size: string;
    color: string;
    image: string;
    sale: string;
    handle: string;
  };
  cartId: string;
  itemId: string;
  currencySymbol: string;
};

export const CartItem = ({
  product,
  cartId,
  itemId,
  currencySymbol,
}: CartItemProps) => {
  const t = useTranslations('Header.cart.drawer');
  const sale = Number(product.sale);
  const price = Number(product.price);
  const discountedPrice = price - (price * sale) / 100;
  const symbol = getSymbolFromCurrency(currencySymbol);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          <Link
            href={`/product/${product.handle}`}
            className="shrink-0 relative w-24 h-32 md:w-32 md:h-40"
          >
            {product.image && (
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover rounded"
              />
            )}
          </Link>

          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <Link
                href={`/product/${product.handle}`}
                className="font-medium text-base hover:underline line-clamp-2"
              >
                {product.title}
              </Link>

              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                {product.size && (
                  <p>
                    {t('sizeLabel')} {product.size}
                  </p>
                )}
                {product.color && <p>Color: {product.color}</p>}
              </div>

              <div className="mt-2">
                {sale > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="line-through text-muted-foreground">
                      {price.toFixed(0)}
                      {symbol}
                    </span>
                    <span className="text-red-500 font-medium">
                      {discountedPrice.toFixed(0)}
                      {symbol}
                    </span>
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                      -{sale}%
                    </span>
                  </div>
                ) : (
                  <span className="font-medium">
                    {price.toFixed(0)}
                    {symbol}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  x {product.quantity}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className={cn('font-medium', { 'text-red-500': sale > 0 })}>
                  {Number(product.totalPrice).toFixed(0)}
                  {symbol}
                </span>
                <RemoveItemButton cartId={cartId} itemId={itemId} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
