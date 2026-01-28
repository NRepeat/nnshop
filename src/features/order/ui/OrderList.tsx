'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link } from '@shared/i18n/navigation';
import { Button } from '@shared/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { OrderCard } from './OrderCard';

type LineItem = {
  title: string;
  image?: {
    url: string;
  };
};

type Order = {
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

type OrderListProps = {
  orders: Order[];
};

type SortButtonProps = {
  title: string;
  sortKey: string;
  sortBy: string | null;
  order: string | null;
  createSortLink: (newSortBy: string) => string;
};

const SortButton = ({
  title,
  sortKey,
  sortBy,
  order,
  createSortLink,
}: SortButtonProps) => {
  const isActive = sortBy === sortKey;

  return (
    <Button variant={isActive ? 'default' : 'outline'} size="sm" asChild>
      <Link href={createSortLink(sortKey)} className="flex items-center gap-1">
        {title}
        {isActive && (order === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        ))}
      </Link>
    </Button>
  );
};

export const OrderList = ({ orders }: OrderListProps) => {
  const t = useTranslations('OrderPage.list');
  const tSort = useTranslations('OrderPage');
  const searchParams = useSearchParams();
  const sortBy = searchParams.get('sortBy');
  const order = searchParams.get('order');

  const createSortLink = (newSortBy: string) => {
    const newOrder = sortBy === newSortBy && order === 'asc' ? 'desc' : 'asc';
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', newSortBy);
    params.set('order', newOrder);
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground self-center mr-2">
          {tSort('sortBy')}:
        </span>
        <SortButton
          title={t('date')}
          sortKey="date"
          sortBy={sortBy}
          order={order}
          createSortLink={createSortLink}
        />
        <SortButton
          title={t('fulfillmentStatus')}
          sortKey="status"
          sortBy={sortBy}
          order={order}
          createSortLink={createSortLink}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};
