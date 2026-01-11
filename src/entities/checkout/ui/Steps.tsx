import {
  ChevronRight,
  User,
  Truck,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import Step from './Step';
import clsx from 'clsx';
import { getTranslations } from 'next-intl/server';

const steps = {
  info: {
    slug: 'info',
    link: '/checkout/info',
    icon: <User />,
  },
  delivery: {
    slug: 'delivery',
    link: '/checkout/delivery',
    icon: <Truck />,
  },
  payment: {
    slug: 'payment',
    link: '/checkout/payment',
    icon: <CreditCard />,
  },
  success: {
    slug: 'success',
    link: '/checkout/success',
    icon: <CheckCircle />,
  },
};

export const Steps = async ({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) => {
  const t = await getTranslations({ locale, namespace: 'CheckoutSteps' });
  const disablePaymentButton = (slug: string) => {
    const isPaymentStep = slug === 'payment';
    return isPaymentStep;
  };

  return (
    <div className="flex  justify-around items-center py-4 px-4">
      {(Object.keys(steps) as Array<keyof typeof steps>).map((step, index) => (
        <div key={index} className={clsx('w-full flex items-center')}>
          <Step
            link={steps[step].link}
            title={t(steps[step].slug)}
            icon={steps[step].icon}
            isActive={slug === steps[step].slug}
            disabled={disablePaymentButton(step) || slug === 'success'}
          />
          <div className="w-full flex items-center justify-center">
            {index < Object.keys(steps).length - 1 && (
              <ChevronRight className="w-6 h-6 text-gray-400 mx-2 shrink-0" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
