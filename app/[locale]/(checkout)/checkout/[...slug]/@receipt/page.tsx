import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card';

import {
  ContactInfoSection,
  DeliveryInfoSection,
  PaymentInfoSection,
} from '@features/checkout/receipt';
import { getTranslations } from 'next-intl/server';

export default async function Receipt() {
  const t = await getTranslations('ReceiptPage');
  return (
    <div className="flex flex-col items-center  w-full container">
      <Card className="w-full shadow-none rounded-none  bg-gray-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className=" text-center px-2">
          <div className="flex flex-col items-center justify-center space-y-2 ">
            <ContactInfoSection />
            <DeliveryInfoSection />
            <PaymentInfoSection />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
