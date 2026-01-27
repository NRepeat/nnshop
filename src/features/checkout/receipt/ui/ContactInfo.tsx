import getContactInfo from '@features/checkout/contact-info/api/get-contact-info';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip';
import { Link } from '@shared/i18n/navigation';import ContactInfo from '@shared/assets/ContactInfo';
import { PlaceHolder } from './PlaceHolder';
import { getTranslations } from 'next-intl/server';

export default async function ContactInfoSection({ locale }: { locale: string }) {
  const contactInfo = await getContactInfo();
  const t = await getTranslations({ locale, namespace: 'ReceiptPage' });
  return (
    <>
      {contactInfo ? (
        <Tooltip>
          <TooltipTrigger className="w-full">
            <Link href={'/checkout/info'} className="w-full">
              <div className="flex items-center gap-3 p-3 w-full min-h-[72px] bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="shrink-0 text-gray-400">
                  <ContactInfo />
                </div>
                <div className="flex flex-col text-start space-y-0.5 min-w-0 w-full">
                  <p className="text-sm text-gray-700 truncate">
                    <span className="font-medium text-gray-900">{t('name')}: </span>
                    {contactInfo.name}
                  </p>
                  <p className="text-sm text-gray-700 truncate">
                    <span className="font-medium text-gray-900">{t('email')}: </span>
                    {contactInfo.email}
                  </p>
                  <p className="text-sm text-gray-700 truncate">
                    <span className="font-medium text-gray-900">{t('phone')}: </span>
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
