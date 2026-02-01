'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@shared/i18n/navigation';
import { User, Truck, CreditCard, CheckCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { type CheckoutStep } from '@features/checkout/api/getCompletedSteps';

type CheckoutStepperProps = {
  completedSteps: CheckoutStep[];
};

type StepConfig = {
  key: CheckoutStep | 'success';
  href: string;
  icon: React.ReactNode;
};

const steps: StepConfig[] = [
  { key: 'info', href: '/checkout/info', icon: <User className="w-4 h-4" /> },
  { key: 'delivery', href: '/checkout/delivery', icon: <Truck className="w-4 h-4" /> },
  { key: 'payment', href: '/checkout/payment', icon: <CreditCard className="w-4 h-4" /> },
  { key: 'success', href: '/checkout/success', icon: <CheckCircle className="w-4 h-4" /> },
];

const stepOrder: (CheckoutStep | 'success')[] = ['info', 'delivery', 'payment', 'success'];

export const CheckoutStepper = ({ completedSteps }: CheckoutStepperProps) => {
  const t = useTranslations('CheckoutSteps');
  const pathname = usePathname();

  const getCurrentStep = (): CheckoutStep | 'success' => {
    if (pathname.includes('/checkout/success')) return 'success';
    if (pathname.includes('/checkout/payment')) return 'payment';
    if (pathname.includes('/checkout/delivery')) return 'delivery';
    return 'info';
  };

  const currentStep = getCurrentStep();
  const currentStepIndex = stepOrder.indexOf(currentStep);

  const isStepAccessible = (stepKey: CheckoutStep | 'success'): boolean => {
    // Success step is never clickable
    if (stepKey === 'success') return false;

    // On success page, nothing is clickable
    if (currentStep === 'success') return false;

    const stepIndex = stepOrder.indexOf(stepKey);

    // Current step is not clickable (already on it)
    if (stepIndex === currentStepIndex) return false;

    // Can go back to any completed step
    if (stepIndex < currentStepIndex) {
      const previousSteps = stepOrder.slice(0, stepIndex) as CheckoutStep[];
      return previousSteps.every((step) => completedSteps.includes(step));
    }

    // Can only go forward ONE step at a time, and only if all previous steps are completed
    if (stepIndex > currentStepIndex + 1) return false;

    const previousSteps = stepOrder.slice(0, stepIndex) as CheckoutStep[];
    return previousSteps.every((step) => completedSteps.includes(step));
  };

  const isStepCompleted = (stepKey: CheckoutStep | 'success'): boolean => {
    if (stepKey === 'success') return currentStep === 'success';
    return completedSteps.includes(stepKey);
  };

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between container">
        {steps.map((step, index) => {
          const isActive = step.key === currentStep;
          const isCompleted = isStepCompleted(step.key) || index < currentStepIndex;
          const isAccessible = isStepAccessible(step.key);
      

          const StepIcon = (
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0',
                isCompleted || isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
                isActive && 'ring-2 ring-primary ring-offset-2',
                !isAccessible && !isActive && 'cursor-not-allowed opacity-50'
              )}
            >
              {step.icon}
            </div>
          );

          return (
            <div key={step.key} className="flex flex-col items-center first:items-start last:items-end flex-1 h-12">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div
                    className={cn(
                      'h-1 flex-1 transition-colors',
                      index <= currentStepIndex ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
                {isAccessible ? (
                  <Link href={step.href} className="hover:opacity-80 transition-opacity">
                    {StepIcon}
                  </Link>
                ) : (
                  StepIcon
                )}
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
                  isCompleted || isActive
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
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
