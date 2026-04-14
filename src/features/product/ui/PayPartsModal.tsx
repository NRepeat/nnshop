'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared/ui/dialog';
import { useTranslations } from 'next-intl';
import { getCurrencySymbol } from '@shared/lib/utils/getCurrencySymbol';
import { Button } from '@shared/ui/button';

interface PayPartsModalProps {
  price: number;
  currencyCode: string;
  /** When provided, the component is controlled (used in checkout) */
  initialPartsCount?: number;
  onPartsCountChange?: (count: number) => void;
}

export function PayPartsModal({
  price,
  currencyCode,
  initialPartsCount,
  onPartsCountChange,
}: PayPartsModalProps) {
  const t = useTranslations('PayParts');
  const [internalCount, setInternalCount] = useState(initialPartsCount ?? 3);
  const partsCount = initialPartsCount ?? internalCount;
  const currency = getCurrencySymbol(currencyCode);
  const perPart = Math.ceil(price / partsCount);

  const handleSelect = (count: number) => {
    setInternalCount(count);
    onPartsCountChange?.(count);
  };

  if (price < 300) return null;

  const triggerLabel = onPartsCountChange
    ? t('title')
    : t('payInParts', { count: partsCount, amount: perPart, currency });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-start cursor-pointer text-sm hover:text-green-800 underline underline-offset-2 transition-colors"
        >
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold uppercase tracking-wide">
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Parts selector */}
          <div className="space-y-3">
            <p className="text-center text-sm font-medium text-gray-700">
              {t('numberOfPayments')}
            </p>
            <div className="flex gap-3 justify-center">
              {[2, 3].map((count) => (
                <Button
                  key={count}
                  type="button"
                  onClick={() => handleSelect(count)}
                  className={`w-16 h-16 rounded-lg border-2 text-xl font-bold transition-all ${
                    partsCount === count
                      ? 'bg-primary'
                      : 'border-gray-300 bg-white text-gray-700 hover:text-white hover:border-gray-400'
                  }`}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="flex items-center justify-between px-4 py-5 bg-gray-50 rounded-lg">
            <span className="text-gray-600">{t('youPay')}</span>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {partsCount} {t('payments')}
              </p>
              <p className="text-lg">
                {t('perPayment', {
                  amount: perPart.toLocaleString('uk-UA'),
                  currency,
                })}
              </p>
            </div>
          </div>

          {/* Benefits list */}
          <ul className="space-y-4 text-sm">
            <li>
              <p className="font-semibold">{t('noPaperwork')}</p>
              <p className="text-gray-600">{t('noPaperworkDesc')}</p>
            </li>
            <li>
              <p className="font-semibold">{t('noHiddenFees')}</p>
              <p className="text-gray-600">{t('noHiddenFeesDesc')}</p>
            </li>
            <li>
              <p className="font-semibold">{t('earlyRepayment')}</p>
              <p className="text-gray-600">{t('earlyRepaymentDesc')}</p>
            </li>
          </ul>

          <p className="text-xs text-center text-gray-500">
            {t('earlyRepaymentNote')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
