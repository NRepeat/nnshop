'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@shared/i18n/navigation';
import { Card, CardContent, CardHeader } from '@shared/ui/card';
import { OrderStatusBadge } from './OrderStatusBadge';

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
    createdAt: string;
    displayFulfillmentStatus: string;
    totalPriceSet: {
      shopMoney: {
        amount: string;
        currencyCode: string;
      };
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

  return (
    <Link href={`/orders/${numericId}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-lg">{order.name}</span>
            <OrderStatusBadge status={order.displayFulfillmentStatus} />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            <span className="font-medium text-foreground">
              {order.totalPriceSet.shopMoney.amount}{' '}
              {order.totalPriceSet.shopMoney.currencyCode}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {lineItems.length > 0 && (
            <div className="flex gap-2 mt-2">
              {lineItems.map(({ node: item }, index) => (
                <div
                  key={index}
                  className="relative w-14 h-14 rounded-md overflow-hidden bg-muted"
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
                <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground">
                  +{(order.lineItems?.edges.length || 0) - 4}
                </div>
              )}
            </div>
          )}
          <div className="mt-3 text-sm text-primary hover:border-b hover:border-primary w-fit transition-colors">
            {t('viewDetails')} →
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
