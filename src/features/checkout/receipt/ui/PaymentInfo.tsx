import { getPaymentInfo } from '@features/checkout/payment/api/getPaymentInfo';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip';
import { Link } from '@shared/i18n/navigation';import { PlaceHolder } from './PlaceHolder';
import PaymentInfo from '@shared/assets/PaymentInfo';
import { getTranslations } from 'next-intl/server';

export default async function PaymentInfoSection({ locale }: { locale: string }) {
  const paymentInfo = await getPaymentInfo();
  const t = await getTranslations({ locale, namespace: 'PaymentForm' });
  const tr = await getTranslations({ locale, namespace: 'ReceiptPage' });
  return (
    <>
      {paymentInfo ? (
        <Tooltip>
          <TooltipTrigger className="w-full">
            <Link href={'/checkout/payment'} className="w-full">
              <div className="flex items-center gap-3 p-3 w-full min-h-[72px] bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="shrink-0 text-gray-400">
                  <PaymentInfo />
                </div>
                <div className="flex flex-col text-start space-y-0.5 min-w-0 w-full">
                  <p className="text-sm text-gray-700 truncate">
                    <span className="font-medium text-gray-900">
                      {tr('payment_method')}:{' '}
                    </span>
                    {t(paymentInfo.paymentMethod)}
                  </p>
                </div>
              </div>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tr('payment_information')}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <PlaceHolder toolTipDescription={tr('payment_information')}>
          <PaymentInfo />
        </PlaceHolder>
      )}
    </>
  );
}
