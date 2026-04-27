'use client';

import { useBonusStore } from '@shared/store/use-bonus-store';
import clsx from 'clsx';

function formatPrice(price: number): string {
  return Math.round(price)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function OrderTotal({
  title,
  grandTotal,
  currencySymbol,
  isMobile = false,
}: {
  title?: string;
  grandTotal: number;
  currencySymbol: string;
  isMobile?: boolean;
}) {
  const bonusSpend = useBonusStore((state) => state.bonusSpend);
  const finalTotal = Math.max(0, grandTotal - bonusSpend);

  if (isMobile) {
    return (
      <p className="text-xs text-gray-500">
        {formatPrice(finalTotal)} {currencySymbol}
      </p>
    );
  }

  return (
    <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-100">
      <span className="text-gray-900">{title}</span>
      <span className="text-gray-900">
        {formatPrice(finalTotal)} {currencySymbol}
      </span>
    </div>
  );
}
