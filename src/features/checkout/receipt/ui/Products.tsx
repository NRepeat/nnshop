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
import { getOrder } from '@entities/order/api/getOrder';

export const Products = async ({ orderId }: { orderId?: string }) => {
  const t = await getTranslations('ReceiptPage');
  let lines, cost;

  if (orderId) {
    const order = await getOrder(orderId);
    if (!order) return null;
    lines = order.lineItems.edges;
    cost = {
      subtotalAmount: order.subtotalPriceSet.presentmentMoney,
      totalAmount: order.totalPriceSet.presentmentMoney,
      totalTaxAmount: order.totalTaxSet.presentmentMoney,
    };
  } else {
    const cartData = await getCart();
    if (!cartData?.cart) return null;
    lines = cartData.cart.lines.edges;
    cost = cartData.cart.cost;
  }
  console.log('cost', cost, lines);
  return (
    <Card className="w-full shadow-none rounded-none  bg-gray-100 p-0 ">
      <CardHeader>
        <CardTitle>{t('products_title')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-0 ">
        {lines?.map((line) => (
          <div key={line.node.quantity} className="flex items-center gap-4">
            {/*<Image
              alt={line.node.merchandise.product.title}
              className="rounded-none"
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
            </div>*/}
          </div>
        ))}
        <Separator />
        {/*<div className="grid gap-2">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 dark:text-gray-400">{t('subtotal')}</p>
            <p className="font-medium">
              {cart.cart?.cost.subtotalAmount.amount.toLocaleString('en-US', {
                style: 'currency',
                currency: cart.cart?.cost.subtotalAmount.currencyCode,
              })}
            </p>
          </div>
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
        </div>*/}
      </CardContent>
    </Card>
  );
};
