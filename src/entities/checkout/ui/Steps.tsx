import { ChevronRight } from 'lucide-react';
import Step from './Step';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

const steps = {
  info: {
    slug: 'info',
    link: '/checkout/info',
  },
  delivery: {
    slug: 'delivery',
    link: '/checkout/delivery',
  },
  payment: {
    slug: 'payment',
    link: '/checkout/payment',
  },
};

export const Steps = ({ slug }: { slug: string }) => {
  const t = useTranslations('CheckoutSteps');
  return (
    <div className="flex  justify-around items-center py-4 px-4">
      {(Object.keys(steps) as Array<keyof typeof steps>).map((step, index) => (
        <div key={index} className={clsx('w-full flex items-center')}>
          <Step
            link={steps[step].link}
            title={t(steps[step].slug)}
            isActive={slug === steps[step].slug}
            isCompleted={index < Object.keys(steps).indexOf(slug)}
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
