'use client';

import { Card, CardContent } from '@shared/ui/card';
import { Separator } from '@shared/ui/separator';
import { Button } from '@shared/ui/button';
import { Link } from '@shared/i18n/navigation';
import { useTranslations } from 'next-intl';
import getSymbolFromCurrency from 'currency-symbol-map';
import { DiscountCodeInput } from './DiscountCodeInput';
import { CartNoteTextarea } from '@features/header/cart/ui/CartNoteTextarea';
import { CartItem } from './CartItem';

type CartItemType = {
  id: string;
  title: string;
  price: string;
  size: string;
  handle: string;
  totalPrice: string;
  quantity: number;
  color: string;
  image: string;
  sale: string;
};

type CartPageContentProps = {
  items: CartItemType[];
  subtotal: number;
  currencySymbol: string;
  cartId: string;
  discountCodes: Array<{ code: string; applicable: boolean }>;
  cartNote: string;
};

export const CartPageContent = ({
  items,
  subtotal,
  currencySymbol,
  cartId,
  discountCodes,
}: CartPageContentProps) => {
  const t = useTranslations('CartPage');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <CartItem
            key={item.id}
            product={item}
            cartId={cartId}
            itemId={item.id}
            currencySymbol={currencySymbol}
          />
        ))}

        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">{t('order_note')}</h3>
            <CartNoteTextarea placeholder={t('order_note_placeholder')} />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              {/* <div className="flex justify-between text-sm">
                <span>{t('subtotal')}</span>
                <span>
                  {getSymbolFromCurrency(currencySymbol)} {subtotal.toFixed(0)}
                </span>
              </div> */}
              {discountCodes.some((d) => d.applicable) && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('discount')}</span>
                  <span>-</span>
                </div>
              )}
            </div>

            <Separator />

            {/* <div className="flex justify-between font-medium text-lg">
              <span>{t('total')}</span>
              <span>
                {getSymbolFromCurrency(currencySymbol)} {subtotal.toFixed(0)}
              </span>
            </div> */}

            <Separator />

            <DiscountCodeInput discountCodes={discountCodes} />

            <Button asChild className="w-full" size="lg">
              <Link href="/checkout/info">{t('checkout')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
