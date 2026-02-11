import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { User, Truck, CreditCard } from 'lucide-react';
import { Link } from '@shared/i18n/navigation';
import getContactInfo from '@features/checkout/contact-info/api/get-contact-info';
import {
  OrderSummary,
  OrderSummarySkeleton,
} from '@features/checkout/receipt/ui/OrderSummary';
import { headers } from 'next/headers';
import { auth } from '@features/auth/lib/auth';

type Props = {
  params: Promise<{ locale: string }>;
};

function ReceiptSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-none border border-gray-100 bg-white p-4 animate-pulse">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gray-100" />
      <div className="flex flex-col gap-2 w-full">
        <div className="h-3 w-24 rounded-full bg-gray-100" />
        <div className="h-3 w-40 rounded-full bg-gray-100" />
        <div className="h-3 w-32 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

function EmptyCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-dashed border-gray-200 bg-gray-50/50 p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-400">
        {icon}
      </div>
      <div className="flex flex-col gap-2 w-full">
        <span className="text-xs font-medium text-gray-400">{label}</span>
        <div className="flex flex-col gap-1.5">
          <div className="h-2.5 w-3/4 rounded-full bg-gray-100" />
          <div className="h-2.5 w-1/2 rounded-full bg-gray-100" />
        </div>
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

  if (!contactInfo) {
    return (
      <EmptyCard
        icon={<User className="size-5" />}
        label={t('contact_information')}
      />
    );
  }

  return (
    <Link href="/checkout/info" className="group block">
      <div className="flex items-center gap-3 rounded-md border border-gray-100 bg-white p-4 transition-all group-hover:border-gray-300 group-hover:shadow-sm">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
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
    </Link>
  );
}

export default async function DeliveryReceipt(props: Props) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'ReceiptPage' });

  return (
    <>
      {/* Mobile: Collapsible Order Summary */}
      <div className="md:hidden">
        <Suspense fallback={<OrderSummarySkeleton />}>
          <OrderSummary locale={locale} collapsible />
        </Suspense>
      </div>

      {/* Desktop: Full sidebar */}
      <div className="hidden md:flex flex-col gap-3">
        <Suspense fallback={<OrderSummarySkeleton />}>
          <OrderSummary locale={locale} />
        </Suspense>
        <Suspense fallback={<ReceiptSkeleton />}>
          <ContactCard locale={locale} />
        </Suspense>
        <EmptyCard
          icon={<Truck className="size-5" />}
          label={t('delivery_information')}
        />
        <EmptyCard
          icon={<CreditCard className="size-5" />}
          label={t('payment_information')}
        />
      </div>
    </>
  );
}
