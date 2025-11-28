import getContactInfo from '@features/checkout/contact-info/api/get-contact-info';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip';
import { Link } from '@shared/i18n/navigation';
import ContactInfo from '@shared/assets/ContactInfo';
import { PlaceHolder } from './PlaceHolder';
import { getTranslations } from 'next-intl/server';

export default async function ContactInfoSection() {
  const contactInfo = await getContactInfo();
  const t = await getTranslations('ReceiptPage');
  return (
    <>
      {contactInfo ? (
        <Tooltip>
          <TooltipTrigger className="w-full">
            <Link href={'/checkout/info'} className="w-full">
              <div className="flex justify-start p-2.5 py-0.5 w-full bg-white  gap-2 border border-gray-300 items-center ">
                <ContactInfo />
                <div className="flex flex-col text-start justify-start space-y-1  w-full">
                  <p className="text-gray-700 text-overflow-ellipsis">
                    <span className="font-semibold">{t('name')}: </span>
                    {contactInfo.name}
                  </p>
                  <p className="text-gray-700 text-overflow-ellipsis">
                    <span className="font-semibold">{t('email')}: </span>
                    {contactInfo.email}
                  </p>
                  <p className="text-gray-700 text-overflow-ellipsis">
                    <span className="font-semibold">{t('phone')}: </span>
                    {contactInfo.phone}
                  </p>
                </div>
              </div>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('contact_information')}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <PlaceHolder toolTipDescription={t('contact_information')}>
          <ContactInfo />
        </PlaceHolder>
      )}
    </>
  );
}
