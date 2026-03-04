import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { getDeliveryInfo } from '@features/checkout/delivery/api/getDeliveryInfo';
import { getPickupPoint } from '@features/checkout/delivery/lib/pickup-points';
import { getTranslations } from 'next-intl/server';
import { Truck, Home } from 'lucide-react';
import { Link } from '@shared/i18n/navigation';

export default async function DeliveryInfoSection({
  locale,
}: {
  locale: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const [deliveryInfo, t] = await Promise.all([
    getDeliveryInfo(session),
    getTranslations({ locale, namespace: 'ReceiptPage' }),
  ]);

  if (!deliveryInfo) return null;

  const isSelfPickup = deliveryInfo.deliveryMethod === 'selfPickup';
  const point =
    isSelfPickup && deliveryInfo.selfPickupPoint
      ? getPickupPoint(deliveryInfo.selfPickupPoint)
      : null;

  const icon = isSelfPickup ? (
    <Home className="size-5" />
  ) : (
    <Truck className="size-5" />
  );

  let line1 = '';
  let line2 = '';

  if (isSelfPickup && point) {
    line1 = `Самовивіз: ${point.name}`;
    line2 = point.fullAddress;
  } else if (deliveryInfo.deliveryMethod === 'novaPoshta') {
    line1 = deliveryInfo.novaPoshtaDepartment?.shortName || 'Нова Пошта';
    line2 = deliveryInfo.novaPoshtaDepartment?.addressParts?.city || '';
  } else if (deliveryInfo.deliveryMethod === 'ukrPoshta') {
    line1 = `${deliveryInfo.address || ''} ${deliveryInfo.apartment || ''}`.trim();
    line2 = `${deliveryInfo.city || ''} ${deliveryInfo.postalCode || ''}`.trim();
  }

  return (
    <Link href="/checkout/delivery" className="group block">
      <div className="flex items-center gap-3 rounded border border-gray-100 bg-white p-4 transition-all group-hover:border-gray-300 group-hover:shadow-sm">
        <div className="flex size-10 shrink-0 items-center justify-center rounded bg-green-50 text-green-600">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-medium text-gray-400">
            {t('delivery_information')}
          </p>
          {line1 && (
            <p className="truncate text-sm text-gray-900">{line1}</p>
          )}
          {line2 && (
            <p className="truncate text-sm text-gray-500">{line2}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
