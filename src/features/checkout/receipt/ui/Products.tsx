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
import Image from 'next/image';
import { CheckoutConfig } from '@features/checkout/config';
import { getOrder } from '@entities/order/api/getOrder';

export const Products = async ({ orderId }: { orderId?: string }) => {
  const t = await getTranslations('ReceiptPage');
  let lines, cost: any;

  if (orderId) {
    const order = await getOrder(orderId);
    if (!order) return null;
    lines = order.lineItems.edges;
    cost = {
      subtotalAmount: order.subtotalPriceSet.presentmentMoney,
      totalAmount: order.totalPriceSet.presentmentMoney,
      totalTaxAmount: order.totalTaxSet.presentmentMoney,
    };
    return (
      <Card className="w-full shadow-none rounded-none  bg-gray-100 p-0 ">
        <CardHeader>
          <CardTitle>{t('products_title')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-0 ">
          {lines?.map((line) => (
            <div
              key={line.node.quantity}
              className="flex items-center h-28 gap-4 px-2.5 py-2.5  bg-white border border-gray-300"
            >
              <Image
                alt={line.node.title}
                className="rounded-none"
                height={80}
                src={line.node.image?.url}
                width={80}
              />
              <div className="grid gap-1 text-sm w-full">
                <p className="font-medium text-start">{line.node.title}</p>
                <div className="flex items-center gap-2">
                  <p className="text-gray-500 dark:text-gray-400">
                    {/* @ts-ignore */}
                    {line.node.quantity} x {line.node.variant.price}
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {/* @ts-ignore */}
                    {Number(line.node.variant.price) *
                      Number(line.node.quantity)}
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {cost.totalAmount.currencyCode}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <Separator />
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400">
                {t('subtotal')}
              </p>
              <p className="font-medium">
                {cost.totalAmount.currencyCode}{' '}
                {cost.subtotalAmount.amount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: cost.subtotalAmount.currencyCode,
                })}
              </p>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-medium">
              <p>{t('total')}</p>
              <p>
                {cost.totalAmount.currencyCode}{' '}
                {cost.totalAmount.amount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'UAH',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  } else {
    const cartData = await getCart();
    if (!cartData?.cart) return null;
    lines = cartData.cart.lines.edges;
    cost = cartData.cart.cost;
  }
  return (
    <Card className="w-full shadow-none rounded-none  bg-gray-100 p-0 ">
      <CardHeader>
        <CardTitle>{t('products_title')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-0 ">
        {lines?.map((line) => (
          <div
            key={line.node.quantity}
            className="flex items-center h-28 gap-4 px-2.5 py-2.5  bg-white border border-gray-300"
          >
            <Image
              alt={line.node.merchandise.product.title}
              className="rounded-none"
              height={80}
              src={line.node.merchandise.image?.url}
              width={80}
            />
            <div className="grid gap-1 text-sm w-full">
              <p className="font-medium text-start">
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
                <p className="text-gray-900 dark:text-gray-100">
                  {line.node.cost.totalAmount.currencyCode}
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
              {cost.totalAmount.currencyCode}{' '}
              {cost.subtotalAmount.amount.toLocaleString('en-US', {
                style: 'currency',
                currency: cost.subtotalAmount.currencyCode,
              })}
            </p>
          </div>
          <Separator />
          <div className="flex items-center justify-between font-medium">
            <p>{t('total')}</p>
            <p>
              {cost.totalAmount.currencyCode}{' '}
              {cost.totalAmount.amount.toLocaleString('en-US', {
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
