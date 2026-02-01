import { getDeliveryInfo } from '@features/checkout/delivery/api/getDeliveryInfo';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip';
import { Link } from '@shared/i18n/navigation';
import DeliveryInfo from '@shared/assets/DeliveryInfo';
import { PlaceHolder } from './PlaceHolder';
import { getTranslations } from 'next-intl/server';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';

export default async function DeliveryInfoSection({
  locale,
}: {
  locale: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  const deliveryInfo = await getDeliveryInfo(session);
  const t = await getTranslations({ locale, namespace: 'ReceiptPage' });
  return (
    <>
      {deliveryInfo ? (
        <Tooltip>
          <TooltipTrigger className="w-full">
            <Link href={'/checkout/delivery'} className="w-full">
              <div className="flex items-center gap-3 p-3 w-full min-h-[72px] bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="shrink-0 text-gray-400">
                  <DeliveryInfo />
                </div>
                {deliveryInfo.novaPoshtaDepartment ? (
                  <div className="flex flex-col text-start space-y-0.5 min-w-0 w-full">
                    <p className="text-sm text-gray-700 truncate">
                      {deliveryInfo.novaPoshtaDepartment.shortName}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col text-start space-y-0.5 min-w-0 w-full">
                    <p className="text-sm text-gray-700 truncate">
                      <span className="font-medium text-gray-900">
                        {t('address')}:{' '}
                      </span>
                      {deliveryInfo.address}
                    </p>
                    <p className="text-sm text-gray-700 truncate">
                      <span className="font-medium text-gray-900">
                        {t('country')}:{' '}
                      </span>
                      {deliveryInfo.country}
                    </p>
                    <p className="text-sm text-gray-700 truncate">
                      <span className="font-medium text-gray-900">
                        {t('city')}:{' '}
                      </span>
                      {deliveryInfo.city}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p> {t('delivery_information')}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <PlaceHolder toolTipDescription={t('delivery_information')}>
          <DeliveryInfo />
        </PlaceHolder>
      )}
    </>
  );
}
