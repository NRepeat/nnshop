import { getCart } from '@entities/cart/api/get';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card';
import { Separator } from '@shared/ui/separator';
import Image from 'next/image';
import { getOrder } from '@entities/order/api/getOrder';
import { prisma } from '@shared/lib/prisma';

export const Products = async ({
  druftOrderId,
  locale,
}: {
  druftOrderId?: string;
  locale: string;
}) => {
  const t = await getTranslations({ locale, namespace: 'ReceiptPage' });
  let lines, cost: any;
  if (druftOrderId) {
    const draftOrder = await prisma.order.findUnique({
      where: {
        shopifyDraftOrderId: 'gid://shopify/DraftOrder/' + druftOrderId,
      },
    });
    if (!draftOrder) {
      throw new Error('Draft order not found');
    }
    if (!draftOrder.shopifyOrderId) {
      return null;
      throw new Error('Shopify order ID not found');
    }
    const order = await getOrder(draftOrder.shopifyOrderId);
    if (!order) return null;
    lines = order.lineItems.edges;
    cost = {
      subtotalAmount: order.subtotalPriceSet.presentmentMoney,
      totalAmount: order.totalPriceSet.presentmentMoney,
      totalTaxAmount: order.totalTaxSet.presentmentMoney,
    };
    return (
      <Card className="w-full shadow-none rounded-none  bg-gray-100 p-0 ">
        <CardHeader className="p-0">
          <CardTitle>{t('products_title')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-0 ">
          <div className="max-h-[50vh] flex flex-col gap-2 overflow-y-auto">
            {lines?.map((line) => (
              <div
                key={line.node.title}
                className="flex items-center h-28 gap-4 px-2.5 py-2.5  bg-card border border-border"
              >
                <Image
                  alt={line.node.title}
                  className="rounded-none"
                  height={80}
                  src={line.node.image?.url}
                  width={80}
                />
                <div className="grid gap-1 text-sm w-full">
                  <p className="font-medium text-start text-foreground">
                    {line.node.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">
                      {/* @ts-ignore */}
                      {line.node.quantity} x {line.node.variant.price}
                    </p>
                    <p className="text-foreground">
                      {/* @ts-ignore */}
                      {Number(line.node.variant.price) *
                        Number(line.node.quantity)}
                    </p>
                    <p className="text-muted-foreground">
                      {cost.totalAmount.currencyCode}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">{t('subtotal')}</p>
              <p className="font-medium text-foreground">
                {cost.totalAmount.currencyCode}{' '}
                {cost.subtotalAmount.amount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: cost.subtotalAmount.currencyCode,
                })}
              </p>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-medium">
              <p className="text-foreground">{t('total')}</p>
              <p className="text-foreground">
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
        <div className="max-h-[50vh] flex flex-col gap-2 overflow-y-auto">
          {lines?.map((line) => (
            <div
              key={line.node.id}
              className="flex items-center min-h-28 gap-4 px-2.5 py-2.5  bg-card border border-border"
            >
              <Image
                alt={line.node.merchandise.product.title}
                className="rounded-none"
                height={80}
                src={line.node.merchandise.image?.url}
                width={80}
              />
              <div className="grid gap-1 text-sm w-full">
                <p className="font-medium text-start text-foreground">
                  {line.node.merchandise.product.title}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">
                    {line.node.quantity} x{' '}
                    {line.node.cost.amountPerQuantity.amount}
                  </p>
                  <p className="text-foreground">
                    {line.node.cost.totalAmount.amount}
                  </p>
                  <p className="text-muted-foreground">
                    {line.node.cost.totalAmount.currencyCode}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">{t('subtotal')}</p>
            <p className="font-medium text-foreground">
              {cost.totalAmount.currencyCode}{' '}
              {cost.subtotalAmount.amount.toLocaleString('en-US', {
                style: 'currency',
                currency: cost.subtotalAmount.currencyCode,
              })}
            </p>
          </div>
          <Separator />
          <div className="flex items-center justify-between font-medium">
            <p className="text-foreground">{t('total')}</p>
            <p className="text-foreground">
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
