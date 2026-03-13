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
  const isYellow = ['IN_PROGRESS', 'PARTIALLY_FULFILLED'].includes(upper);
  const isRed = ['CANCELLED', 'СКАСОВАНО', 'ВІДМОВА ВІД ОТРИМАННЯ', 'ON_HOLD', 'ОТМЕНЕН'].includes(upper);

  const getStatusLabel = (s: string): string => {
    switch (s.toUpperCase()) {
      case 'FULFILLED': return t('fulfilled');
      case 'UNFULFILLED': return t('unfulfilled');
      case 'IN_PROGRESS': return t('inProgress');
      case 'ON_HOLD': return t('onHold');
      case 'PARTIALLY_FULFILLED': return t('partiallyFulfilled');
      case 'CANCELLED': return t('cancelled');
      case 'СКАСОВАНО': return t('cancelled');
      default: return s;
    }
  };

  return (
    <Badge
      className={cn('rounded', {
        'bg-green-100 text-green-800 border-green-200': isGreen,
        'bg-yellow-100 text-yellow-800 border-yellow-200': isYellow,
        'bg-red-100 text-red-800 border-red-200': isRed,
      })}
      variant={isGreen || isYellow || isRed ? 'outline' : 'secondary'}
    >
      {getStatusLabel(status)}
    </Badge>
  );
};
