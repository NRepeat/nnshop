'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/table';

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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('order')}</TableHead>
          <TableHead>{t('date')}</TableHead>
          <TableHead>{t('fulfillmentStatus')}</TableHead>
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
