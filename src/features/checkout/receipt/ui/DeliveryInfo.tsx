import { getDeliveryInfo } from '@features/checkout/delivery/api/getDeliveryInfo';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip';
import { Link } from '@shared/i18n/navigation';
import DeliveryInfo from '@shared/assets/DeliveryInfo';
import { PlaceHolder } from './PlaceHolder';
import { getTranslations } from 'next-intl/server';

export default async function DeliveryInfoSection() {
  const deliveryInfo = await getDeliveryInfo();
  const t = await getTranslations('ReceiptPage');
  return (
    <>
      {deliveryInfo ? (
        <Tooltip>
          <TooltipTrigger className="w-full">
            <Link href={'/checkout/info'} className="w-full">
              <div className="flex justify-start p-2.5 py-0.5 w-full bg-white  gap-2 border border-gray-300 items-center ">
                <DeliveryInfo />
                {deliveryInfo.novaPoshtaDepartment ? (
                  <div className="flex flex-col text-start justify-start space-y-1  w-full">
                    <p className="text-gray-700 text-overflow-ellipsis">
                      <span className="font-semibold"> </span>
                      {deliveryInfo.novaPoshtaDepartment.shortName}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col text-start justify-start space-y-1  w-full">
                    <p className="text-gray-700 text-overflow-ellipsis">
                      <span className="font-semibold"> {t('address')}: </span>
                      {deliveryInfo.address}
                    </p>
                    <p className="text-gray-700 text-overflow-ellipsis">
                      <span className="font-semibold"> {t('country')}: </span>
                      {deliveryInfo.country}
                    </p>
                    <p className="text-gray-700 text-overflow-ellipsis">
                      <span className="font-semibold"> {t('city')}: </span>
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
