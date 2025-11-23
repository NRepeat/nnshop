import React from 'react';

import { User } from 'lucide-react';
import ContactInfoForm from './ContactInfoForm';
import { Avatar, AvatarImage } from '@shared/ui/avatar';
import { getTranslations } from 'next-intl/server';

export default async function ContactInfo() {
  const t = await getTranslations('CheckoutPage');
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
      <ContactInfoForm />
    </div>
  );
}
