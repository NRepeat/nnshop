'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@shared/i18n/navigation';
import { Card, CardContent, CardHeader } from '@shared/ui/card';
import { OrderStatusBadge } from './OrderStatusBadge';
import { getCurrencySymbol } from '@shared/lib/utils/getCurrencySymbol';

type LineItem = {
  title: string;
  image?: {
    url: string;
  };
};

type OrderCardProps = {
  order: {
    id: string;
    name: string;
    createdAt?: string;
    displayFulfillmentStatus: string;
    totalPriceSet: {
      shopMoney: {
        amount: string;
        currencyCode: string;
      };
    };
    subtotalPriceSet?: {
      shopMoney: {
        amount: string;
        currencyCode: string;
      };
    };
    discountApplications?: {
      edges: {
        node: {
          value:
            | {
                __typename: 'MoneyV2';
                amount: string;
                currencyCode: string;
              }
            | {
                __typename: 'PricingPercentageValue';
                percentage: number;
              };
          code?: string;
          title?: string;
        };
      }[];
    };
    lineItems?: {
      edges: {
        node: LineItem;
      }[];
    };
  };
};

export const OrderCard = ({ order }: OrderCardProps) => {
  const t = useTranslations('OrderPage');
  const numericId = order.id.split('/').pop();
  const lineItems = order.lineItems?.edges.slice(0, 4) || [];
  const hasMoreItems = (order.lineItems?.edges.length || 0) > 4;

  // Check if discount was applied
  const hasDiscount =
    order.discountApplications?.edges &&
    order.discountApplications.edges.length > 0;
  const discountCode = hasDiscount
    ? order.discountApplications!.edges[0].node.code ||
      order.discountApplications!.edges[0].node.title
    : null;

  return (
    <Link href={`/orders/${numericId}`}>
      <Card className="group h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer rounded p-4">
        <CardHeader className="pb-2 px-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-lg">{order.name}</span>
            <OrderStatusBadge status={order.displayFulfillmentStatus} />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</span>
            <div className="flex flex-col items-end gap-0.5">
              {hasDiscount && order.subtotalPriceSet ? (
                <>
                  <span className="text-xs line-through text-muted-foreground">
                    {Math.round(Number(order.subtotalPriceSet.shopMoney.amount))}{' '}
                    {order.subtotalPriceSet.shopMoney.currencyCode}
                  </span>
                  <span className="font-medium text-green-600">
                    {Math.round(Number(order.totalPriceSet.shopMoney.amount))}{' '}
                    {order.totalPriceSet.shopMoney.currencyCode}
                  </span>
                </>
              ) : (
                <span className="font-medium text-foreground">
                  {Math.round(Number(order.totalPriceSet.shopMoney.amount))}{' '}
                  {getCurrencySymbol(order.totalPriceSet.shopMoney.currencyCode)}
                </span>
              )}
            </div>
          </div>
          {hasDiscount && discountCode && (
            <div className="mt-1 text-xs text-green-600 font-medium flex items-center gap-1">
              <span>🏷️</span>
              <span>{discountCode}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className='px-0'>
          {lineItems.length > 0 && (
            <div className="flex gap-2 mt-2">
              {lineItems.map(({ node: item }, index) => (
                <div
                  key={item.image?.url ?? `item-${index}`}
                  className="relative w-14 h-14 rounded overflow-hidden bg-muted"
                >
                  {item.image?.url ? (
                    <Image
                      src={item.image.url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      ?
                    </div>
                  )}
                </div>
              ))}
              {hasMoreItems && (
                <div className="w-14 h-14 rounded bg-muted flex items-center justify-center text-sm text-muted-foreground">
                  +{(order.lineItems?.edges.length || 0) - 4}
                </div>
              )}
            </div>
          )}
          <div className="mt-3 text-sm text-primary group-hover:underline  duration-300 decoration-transparent group-hover:decoration-primary  transition-all w-fit ">
            {t('viewDetails')} →
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
