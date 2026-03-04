'use client';

import { Badge } from '@shared/ui/badge';
import { useTranslations } from 'next-intl';
import { cn } from '@shared/lib/utils';

type OrderStatusBadgeProps = {
  status: string;
};

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const t = useTranslations('OrderPage.status');
  const upper = status.toUpperCase();

  const isGreen = ['FULFILLED', 'ОБРОБЛЕНО'].includes(upper);
  const isRed = ['CANCELLED', 'СКАСОВАНО', 'ВІДМОВА ВІД ОТРИМАННЯ', 'ON_HOLD', 'ОТМЕНЕН'].includes(upper);

  const getStatusLabel = (s: string): string => {
    switch (s.toUpperCase()) {
      case 'FULFILLED': return t('fulfilled');
      case 'UNFULFILLED': return t('unfulfilled');
      case 'ON_HOLD': return t('onHold');
      case 'PARTIALLY_FULFILLED': return t('partiallyFulfilled');
      case 'ОБРОБЛЕНО': return s;
      case 'СКАСОВАНО': return s;
      case 'ВІДМОВА ВІД ОТРИМАННЯ': return s;
      case 'ОТМЕНЕН': return s;
      default: return s;
    }
  };

  return (
    <Badge
      className={cn('rounded', {
        'bg-green-100 text-green-800 border-green-200': isGreen,
        'bg-red-100 text-red-800 border-red-200': isRed,
      })}
      variant={isGreen || isRed ? 'outline' : 'secondary'}
    >
      {getStatusLabel(status)}
    </Badge>
  );
};
