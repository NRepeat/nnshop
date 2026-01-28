import { getTranslations } from 'next-intl/server';
import { User, Truck, CreditCard } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string }>;
};

function EmptyCard({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-none border border-dashed border-gray-200 bg-gray-50/50 p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
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

export default async function InfoReceipt(props: Props) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'ReceiptPage' });

  return (
    <div className="hidden md:flex flex-col gap-3">
      <EmptyCard icon={<User className="size-5" />} label={t('contact_information')} />
      <EmptyCard icon={<Truck className="size-5" />} label={t('delivery_information')} />
      <EmptyCard icon={<CreditCard className="size-5" />} label={t('payment_information')} />
    </div>
  );
}
