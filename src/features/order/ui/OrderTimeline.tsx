'use client';

import { useTranslations } from 'next-intl';
import { Check, Package, Truck, Home } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

type OrderTimelineProps = {
  status: string;
};

type TimelineStep = {
  key: string;
  icon: React.ReactNode;
};

const steps: TimelineStep[] = [
  { key: 'ordered', icon: <Check className="w-4 h-4" /> },
  { key: 'processing', icon: <Package className="w-4 h-4" /> },
  { key: 'shipped', icon: <Truck className="w-4 h-4" /> },
  { key: 'delivered', icon: <Home className="w-4 h-4" /> },
];

const getStepIndex = (status: string): number => {
  switch (status) {
    case 'FULFILLED':
      return 3; // delivered
    case 'PARTIALLY_FULFILLED':
      return 2; // shipped
    case 'ON_HOLD':
      return 0; // ordered (on hold)
    case 'UNFULFILLED':
    default:
      return 1; // processing
  }
};

export const OrderTimeline = ({ status }: OrderTimelineProps) => {
  const t = useTranslations('OrderPage.timeline');
  const currentStepIndex = getStepIndex(status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div
                    className={cn(
                      'h-1 flex-1 transition-colors',
                      index <= currentStepIndex ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0',
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                    isCurrent && 'ring-2 ring-primary ring-offset-2'
                  )}
                >
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-1 flex-1 transition-colors',
                      index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-2 text-center',
                  isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {t(step.key)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
