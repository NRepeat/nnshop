import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@shared/ui/card';

import {
  ContactInfoSection,
  DeliveryInfoSection,
  PaymentInfoSection,
} from '@features/checkout/receipt';
import { getTranslations } from 'next-intl/server';
import { Products } from '@features/checkout/receipt/ui/Products';
import { Separator } from '@shared/ui/separator';
import { redirect } from 'next/navigation';

export default async function Receipt({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const t = await getTranslations('ReceiptPage');
  try {
    const { slug } = await params;
    const orderId = slug.length > 1 ? slug[1] : undefined;

    return (
      <div className="flex flex-col items-center  w-full container">
        <Card className="w-full shadow-none rounded-none  bg-gray-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {t('title')}
            </CardTitle>
          </CardHeader>
          <CardContent className=" text-center px-2 space-y-4">
            <Products orderId={orderId} />
            <Separator />
            <div className="flex flex-col items-center justify-center space-y-2 ">
              <ContactInfoSection />
              <DeliveryInfoSection />
              <PaymentInfoSection />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error(error);
    return redirect('/');
  }
}
