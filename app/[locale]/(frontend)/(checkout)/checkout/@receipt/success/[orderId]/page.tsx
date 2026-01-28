import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { User, Truck, CreditCard } from 'lucide-react';
import getContactInfo from '@features/checkout/contact-info/api/get-contact-info';
import { getDeliveryInfo } from '@features/checkout/delivery/api/getDeliveryInfo';
import { getPaymentInfo } from '@features/checkout/payment/api/getPaymentInfo';

type Props = {
  params: Promise<{ locale: string; orderId: string }>;
};

function ReceiptSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-none border border-gray-100 bg-white p-4 animate-pulse">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100" />
      <div className="flex flex-col gap-2 w-full">
        <div className="h-3 w-24 rounded-full bg-gray-100" />
        <div className="h-3 w-40 rounded-full bg-gray-100" />
        <div className="h-3 w-32 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

async function ContactCard({ locale }: { locale: string }) {
  const [contactInfo, t] = await Promise.all([
    getContactInfo(),
    getTranslations({ locale, namespace: 'ReceiptPage' }),
  ]);

  if (!contactInfo) return null;

  return (
    <div className="flex items-center gap-3 rounded-none border border-gray-100 bg-white p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <User className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-medium text-gray-400">{t('contact_information')}</p>
        <p className="truncate text-sm text-gray-900">{contactInfo.name} {contactInfo.lastName}</p>
        <p className="truncate text-sm text-gray-500">{contactInfo.email}</p>
        <p className="truncate text-sm text-gray-500">{contactInfo.phone}</p>
      </div>
    </div>
  );
}

async function DeliveryCard({ locale }: { locale: string }) {
  const [deliveryInfo, t] = await Promise.all([
    getDeliveryInfo(),
    getTranslations({ locale, namespace: 'ReceiptPage' }),
  ]);

  if (!deliveryInfo) return null;

  const isNovaPoshta = !!deliveryInfo.novaPoshtaDepartment;

  return (
    <div className="flex items-center gap-3 rounded-none border border-gray-100 bg-white p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
        <Truck className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-medium text-gray-400">{t('delivery_information')}</p>
        {isNovaPoshta ? (
          <p className="truncate text-sm text-gray-900">
            {deliveryInfo.novaPoshtaDepartment!.shortName}
          </p>
        ) : (
          <>
            <p className="truncate text-sm text-gray-900">{deliveryInfo.address}</p>
            <p className="truncate text-sm text-gray-500">
              {deliveryInfo.city}, {deliveryInfo.country}
            </p>
          </>
        )}
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
    <div className="flex items-center gap-3 rounded-none border border-gray-100 bg-white p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
        <CreditCard className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-medium text-gray-400">{tr('payment_information')}</p>
        <p className="truncate text-sm text-gray-900">{t(paymentInfo.paymentMethod)}</p>
      </div>
    </div>
  );
}

export default async function SuccessReceipt(props: Props) {
  const { locale } = await props.params;

  return (
    <div className="hidden md:flex flex-col gap-3">
      <Suspense fallback={<ReceiptSkeleton />}>
        <ContactCard locale={locale} />
      </Suspense>
      <Suspense fallback={<ReceiptSkeleton />}>
        <DeliveryCard locale={locale} />
      </Suspense>
      <Suspense fallback={<ReceiptSkeleton />}>
        <PaymentCard locale={locale} />
      </Suspense>
    </div>
  );
}
