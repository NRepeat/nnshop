import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@shared/ui/card';
import { Button } from '@shared/ui/button';
import { Link } from '@shared/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { getOrderById } from '@entities/order/api/getOrderById';
import { getCurrencySymbol } from '@shared/lib/utils/getCurrencySymbol';
import Image from 'next/image';

export const Thank = async ({
  params,
}: {
  params: Promise<{
    orderId: string;
    locale: string;
  }>;
}) => {
  const { locale, orderId } = await params;
  const t = await getTranslations({ locale, namespace: 'ThankYouPage' });

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error('Unauthorized');
  }

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
  if (dbOrder?.orderName) {
    displayOrderId = dbOrder.orderName;
  }

  let shopifyOrder = null;
  if (dbOrder?.shopifyOrderId) {
    try {
      shopifyOrder = await getOrderById(
        dbOrder.shopifyOrderId,
        locale.toUpperCase(),
      );
    } catch {
      // non-blocking — page still shows without line items
    }
  }

  const lineItems = shopifyOrder?.lineItems?.edges ?? [];
  const total = shopifyOrder?.totalPriceSet?.presentmentMoney;
  const currencySymbol = total ? getCurrencySymbol(total.currencyCode) : '';

  return (
    <div className="flex justify-center ">
      <Card className="w-full max-w-full p-0 shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold">{t('title')}</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            {t('order_confirmation')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-0">
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('order_id')}
            </p>
            <p className="text-lg font-medium">{displayOrderId}</p>
          </div>

          {lineItems.length > 0 && (
            <div className="space-y-3 border-t border-gray-100 pt-4">
              {lineItems.map(({ node: item }, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.image?.url && (
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded border border-gray-100 bg-white">
                      <Image
                        src={item.image.url}
                        alt={item.title}
                        fill
                        className="object-contain"
                        sizes="48px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.title}
                    </p>

                    <div className="text-xs text-nowrap  w-full flex-row flex text-gray-500">
                      {item.variant?.title &&
                        item.variant.title !== 'Default Title' && (
                          <p className="text-xs text-gray-500">
                            {item.variant.title}
                          </p>
                        )}{' '}
                      <span>×</span> <span>{item.quantity}</span>
                    </div>
                  </div>
                  {item.variant?.price && (
                    <p className="shrink-0 text-sm font-medium text-gray-900">
                      {Math.round(
                        Number(item.variant.price.amount) * item.quantity,
                      )}{' '}
                      {getCurrencySymbol(item.variant.price.currencyCode)}
                    </p>
                  )}
                </div>
              ))}
              {total && (
                <div className="flex justify-between border-t border-gray-100 pt-3 text-sm font-semibold text-gray-900">
                  <span>{t('total')}</span>
                  <span>
                    {Math.round(Number(total.amount))} {currencySymbol}
                  </span>
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('order_confirmation_text')}
          </p>
        </CardContent>
        <CardFooter className="px-0">
          <Button asChild className="w-full rounded">
            <Link href="/">{t('continue_shopping')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
