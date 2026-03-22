import { Link } from '@shared/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { getOrderById } from '@entities/order/api/getOrderById';
import { getCurrencySymbol } from '@shared/lib/utils/getCurrencySymbol';
import Image from 'next/image';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { Button } from '@shared/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@shared/ui/card';
import { connection } from 'next/server';
import { GA4PurchaseEvent } from '@shared/lib/analytics/GA4PurchaseEvent';

export const Thank = async ({
  params,
}: {
  params: Promise<{ orderId: string; locale: string }>;
}) => {
  await connection();
  const { locale, orderId } = await params;
  const t = await getTranslations({ locale, namespace: 'ThankYouPage' });

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  const searchId = decodeURIComponent(orderId);
  let displayOrderId = `#${searchId}`;
  const dbOrder = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      OR: [
        { orderName: { contains: searchId } },
        { shopifyOrderId: { contains: searchId } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
  console.log(dbOrder, 'dbOrder');
  if (dbOrder?.orderName) displayOrderId = dbOrder.orderName;

  let shopifyOrder = null;
  if (dbOrder?.shopifyOrderId) {
    try {
      shopifyOrder = await getOrderById(
        dbOrder.shopifyOrderId,
        locale.toUpperCase(),
      );
      console.log(shopifyOrder, 'shopifyOrder');
    } catch {
      // non-blocking
    }
  }

  const lineItems = shopifyOrder?.lineItems?.edges ?? [];
  const subtotal = shopifyOrder?.subtotalPriceSet?.presentmentMoney;
  const shipping = shopifyOrder?.totalShippingPriceSet?.presentmentMoney;
  const total = shopifyOrder?.totalPriceSet?.presentmentMoney;
  const currencySymbol = total ? getCurrencySymbol(total.currencyCode) : 'грн';
  const email = shopifyOrder?.email || session.user.email;

  const orderDate = dbOrder?.createdAt
    ? new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(dbOrder.createdAt))
    : null;

  return (
    <>
      {total && (
        <GA4PurchaseEvent
          transactionId={displayOrderId}
          value={Number(total.amount)}
          currency={total.currencyCode}
          items={lineItems.map(({ node: item }) => ({
            item_name: item.title,
            item_variant:
              item.variant?.title && item.variant.title !== 'Default Title'
                ? item.variant.title
                : undefined,
            quantity: item.quantity,
            price: Number(item.variant?.price?.amount ?? 0),
          }))}
        />
      )}
      <Card className="w-full max-w-full p-0 shadow-none border-none">
      <CardHeader className="px-0 pb-4 items-center text-center">
        <CardTitle className="text-xl font-bold">{t('title')}</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          {t('order_id')}{' '}
          <span className="font-semibold text-gray-700">{displayOrderId}</span>
          {orderDate && <span className="text-gray-400"> · {orderDate}</span>}
        </CardDescription>
        {email && (
          <p className="text-sm text-gray-500">
            {t('email_sent_to')}{' '}
            <span className="font-medium text-gray-700">{email}</span>
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3 px-0">
        {/* What's next */}
        <div className="flex items-start gap-3 rounded border border-green-100 bg-green-50/60 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded bg-green-100 text-green-700">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-green-800">
              {t('what_next_title')}
            </p>
            <p className="text-sm text-green-700 leading-relaxed mt-0.5">
              {t('what_next_text')}
            </p>
          </div>
        </div>

        {/* Order items */}
        {lineItems.length > 0 && (
          <div className="rounded border border-gray-100 bg-white">
            <p className="px-4 pt-3 pb-2 text-xs font-medium text-gray-400">
              {t('your_order')}
            </p>
            <div className="divide-y divide-gray-50">
              {lineItems.map(({ node: item }, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  {item.image?.url ? (
                    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded border border-gray-100 bg-gray-50">
                      <Image
                        src={item.image.url}
                        alt={item.title}
                        fill
                        className="object-contain"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded border border-gray-100 bg-gray-50">
                      <ShoppingBag className="size-4 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                      {item.title}
                    </p>
                    {item.variant?.title &&
                      item.variant.title !== 'Default Title' && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.variant.title}
                        </p>
                      )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t('quantity')}: {item.quantity}
                    </p>
                  </div>
                  {item.variant?.price && (
                    <p className="shrink-0 text-sm font-semibold text-gray-900">
                      {Math.round(
                        Number(item.variant.price.amount) * item.quantity,
                      )}{' '}
                      {getCurrencySymbol(item.variant.price.currencyCode)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            {total && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-1.5 bg-gray-50/60">
                {subtotal && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{t('subtotal')}</span>
                    <span>
                      {Math.round(Number(subtotal.amount))}{' '}
                      {getCurrencySymbol(subtotal.currencyCode)}
                    </span>
                  </div>
                )}
                {shipping && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{t('shipping')}</span>
                    <span>
                      {Number(shipping.amount) === 0
                        ? t('free')
                        : `${Math.round(Number(shipping.amount))} ${getCurrencySymbol(shipping.currencyCode)}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>{t('total')}</span>
                  <span>
                    {Math.round(Number(total.amount))} {currencySymbol}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-2 px-0 pt-2">
        <Button
          asChild
          className="flex-1 h-10 bg-green-800 hover:bg-green-900 rounded"
        >
          <Link href="/">{t('continue_shopping')}</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 h-10 rounded">
          <Link href="/orders">{t('my_orders')}</Link>
        </Button>
      </CardFooter>
      </Card>
    </>
  );
};
