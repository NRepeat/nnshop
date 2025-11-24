import { getCart } from '@entities/cart/api/get';
import { getTranslations } from 'next-intl/server';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@shared/ui/card';
import { Separator } from '@shared/ui/separator';
import { Button } from '@shared/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { CheckoutConfig } from '@features/checkout/config';

export const Products = async () => {
  const t = await getTranslations('ReceiptPage');
  const cart = await getCart();
  if (!cart) {
    return null;
  }
  return (
    <Card className="w-full shadow-none rounded-none  bg-gray-100 p-0 ">
      <CardHeader>
        <CardTitle>{t('products_title')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-0 ">
        {cart?.cart?.lines.edges.map((line) => (
          <div key={line.node.id} className="flex items-center gap-4">
            <Image
              alt={line.node.merchandise.product.title}
              className="rounded-md"
              height={64}
              src={line.node.merchandise.image?.url}
              width={64}
            />
            <div className="grid gap-1 text-sm">
              <p className="font-medium">
                {line.node.merchandise.product.title}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-gray-500 dark:text-gray-400">
                  {line.node.quantity} x{' '}
                  {line.node.cost.amountPerQuantity.amount}
                </p>
                <p className="text-gray-900 dark:text-gray-100">
                  {line.node.cost.totalAmount.amount}
                </p>
              </div>
            </div>
          </div>
        ))}
        <Separator />
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 dark:text-gray-400">{t('subtotal')}</p>
            <p className="font-medium">
              {cart.cart?.cost.subtotalAmount.amount.toLocaleString('en-US', {
                style: 'currency',
                currency: cart.cart?.cost.subtotalAmount.currencyCode,
              })}
            </p>
          </div>
          {/*<div className="flex items-center justify-between">
            <p className="text-gray-500 dark:text-gray-400">{t('shipping')}</p>
            <p className="font-medium">
              {cart.cart?.cost.totalAmount.amount >
              CheckoutConfig.shipping.free ? (
                'Free'
              ) : (
                <p>
                  {CheckoutConfig.shipping.price.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'UAH',
                  })}
                </p>
              )}
            </p>
          </div>*/}
          <Separator />
          <div className="flex items-center justify-between font-medium">
            <p>{t('total')}</p>
            <p>
              UAH{' '}
              {cart.cart?.cost.totalAmount.amount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'UAH',
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
