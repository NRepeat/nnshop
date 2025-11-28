import { getPaymentInfo } from '@features/checkout/payment/api/getPaymentInfo';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip';
import { Link } from '@shared/i18n/navigation';
import { PlaceHolder } from './PlaceHolder';
import PaymentInfo from '@shared/assets/PaymentInfo';
import { getTranslations } from 'next-intl/server';

export default async function PaymentInfoSection() {
  const paymentInfo = await getPaymentInfo();
  const t = await getTranslations('PaymentForm');
  const tr = await getTranslations('ReceiptPage');
  return (
    <>
      {paymentInfo ? (
        <Tooltip>
          <TooltipTrigger className="w-full">
            <Link href={'/checkout/info'} className="w-full">
              <div className="flex justify-start p-2.5 py-0.5 w-full bg-white  gap-2 border border-gray-300 items-center ">
                <PaymentInfo />
                <div className="flex flex-col text-start justify-start space-y-1  h-full w-full">
                  <p className="text-gray-700 text-overflow-ellipsis">
                    <span className="font-semibold">
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
