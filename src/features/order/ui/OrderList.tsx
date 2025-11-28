'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/table';
import { Button } from '@shared/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';

// This is a temporary Order type.
// The real one from Shopify has more fields.
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
};

type OrderListProps = {
  orders: Order[];
};

export const OrderList = ({ orders }: OrderListProps) => {
  const t = useTranslations('OrderPage.list');
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

  const SortableHeader = ({
    title,
    sortKey,
  }: {
    title: string;
    sortKey: string;
  }) => (
    <TableHead>
      <Link href={createSortLink(sortKey)} className="flex items-center gap-1">
        {title}
        {sortBy
          ? sortKey &&
            (order === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            ))
          : null}
      </Link>
    </TableHead>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('order')}</TableHead>
          <SortableHeader title={t('date')} sortKey="date" />
          <SortableHeader title={t('fulfillmentStatus')} sortKey="status" />
          <TableHead className="text-right">{t('total')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const numericId = order.id.split('/').pop();
          return (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                <Link href={`/orders/${numericId}`} className="hover:underline">
                  {order.name}
                </Link>
              </TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>{order.displayFulfillmentStatus}</TableCell>
              <TableCell className="text-right">
                {order.totalPriceSet.shopMoney.amount}{' '}
                {order.totalPriceSet.shopMoney.currencyCode}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
