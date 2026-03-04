import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { User, CreditCard } from 'lucide-react';
import getContactInfo from '@features/checkout/contact-info/api/get-contact-info';
import { getPaymentInfo } from '@features/checkout/payment/api/getPaymentInfo';
import DeliveryInfoSection from '@features/checkout/receipt/ui/DeliveryInfo';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { Card, CardContent } from '@shared/ui/card';

type Props = {
  params: Promise<{ locale: string; orderId: string }>;
};

function ReceiptSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded border border-gray-100 bg-white p-4 animate-pulse">
      <div className="flex size-10 shrink-0 items-center justify-center rounded bg-gray-100" />
      <div className="flex flex-col gap-2 w-full">
        <div className="h-3 w-24 rounded-full bg-gray-100" />
        <div className="h-3 w-40 rounded-full bg-gray-100" />
        <div className="h-3 w-32 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

async function ContactCard({ locale }: { locale: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const [contactInfo, t] = await Promise.all([
    getContactInfo(session),
    getTranslations({ locale, namespace: 'ReceiptPage' }),
  ]);

  if (!contactInfo) return null;

  return (
    <div className="flex items-center gap-3 rounded border border-gray-100 bg-white p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-600">
        <User className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-medium text-gray-400">
          {t('contact_information')}
        </p>
        <p className="truncate text-sm text-gray-900">
          {contactInfo.name} {contactInfo.lastName}
        </p>
        <p className="truncate text-sm text-gray-500">{contactInfo.email}</p>
        <p className="truncate text-sm text-gray-500">{contactInfo.phone}</p>
      </div>
    </div>
  );
}

async function PaymentCard({ locale }: { locale: string }) {
  const [paymentInfo, t, tr] = await Promise.all([
    getPaymentInfo(),
    getTranslations({ locale, namespace: 'PaymentForm' }),
    getTranslations({ locale, namespace: 'ReceiptPage' }),
  ]);

  if (!paymentInfo) return null;

  return (
    <div className="flex items-center gap-3 rounded border border-gray-100 bg-white p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded bg-green-50 text-green-600">
        <CreditCard className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-medium text-gray-400">
          {tr('payment_information')}
        </p>
        <p className="truncate text-sm text-gray-900">
          {t(paymentInfo.paymentMethod)}
        </p>
      </div>
    </div>
  );
}

export default async function SuccessReceipt(props: Props) {
  const { locale } = await props.params;

  return (
    <Card className="hidden md:flex  p-4 rounded h-fit">
      <CardContent className="flex-col gap-3 p-0 flex">
        <Suspense fallback={<ReceiptSkeleton />}>
          <ContactCard locale={locale} />
        </Suspense>
        <Suspense fallback={<ReceiptSkeleton />}>
          <DeliveryInfoSection locale={locale} />
        </Suspense>
        <Suspense fallback={<ReceiptSkeleton />}>
          <PaymentCard locale={locale} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
