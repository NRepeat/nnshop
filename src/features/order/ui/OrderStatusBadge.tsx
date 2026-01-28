'use client';

import { Badge } from '@shared/ui/badge';
import { useTranslations } from 'next-intl';

type OrderStatus = 'FULFILLED' | 'UNFULFILLED' | 'ON_HOLD' | 'PARTIALLY_FULFILLED';

type OrderStatusBadgeProps = {
  status: string;
};

const statusVariantMap: Record<OrderStatus, 'default' | 'secondary' | 'destructive'> = {
  FULFILLED: 'default',
  UNFULFILLED: 'secondary',
  ON_HOLD: 'destructive',
  PARTIALLY_FULFILLED: 'secondary',
};

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const t = useTranslations('OrderPage.status');

  const variant = statusVariantMap[status as OrderStatus] || 'secondary';

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'FULFILLED':
        return t('fulfilled');
      case 'UNFULFILLED':
        return t('unfulfilled');
      case 'ON_HOLD':
        return t('onHold');
      case 'PARTIALLY_FULFILLED':
        return t('partiallyFulfilled');
      default:
        return status;
    }
  };

  return <Badge variant={variant}>{getStatusLabel(status)}</Badge>;
};
