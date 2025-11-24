import { getUserInfo } from '@shared/lib/customer-account';
import getContactInfo from '../api/get-contact-info';
import ContactInfoForm from './ContactInfoForm';
import { getTranslations } from 'next-intl/server';
import getUser from '@entities/user/api/getUser';

export default async function ContactInfo() {
  const t = await getTranslations('CheckoutPage');
  const contactInfo = await getContactInfo();
  const user = await getUser();
  return (
    <div className="space-y-6 container">
      <div className="flex  gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('contact_info_title')}
          </h1>
          <p className="text-gray-600">{t('contact_info_description')}</p>
        </div>
      </div>
      <ContactInfoForm contactInfo={contactInfo} user={user} />
    </div>
  );
}
