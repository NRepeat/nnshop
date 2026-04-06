import { PackageCheck, CreditCard } from 'lucide-react';
import { PaymentInfo } from '../schema/paymentSchema';
import Image from 'next/image';

export const paymentMethods: {
  id: PaymentInfo['paymentMethod'];
  name: string;
  availableMethods: string[];
  icon: React.ReactNode;
}[] = [
  {
    id: 'after-delivered',
    name: 'After Delivered',
    availableMethods: [],
    icon: <PackageCheck />,
  },
  {
    id: 'pay-now',
    name: 'Pay Now',
    availableMethods: ['bank-transfer', 'liqpay', 'novapay'],
    icon: <CreditCard />,
  },
] as const;

export const paymentProviders: {
  id: PaymentInfo['paymentProvider'];
  name: string;
  icon: React.ReactNode;
  disabled?: boolean;
}[] = [
  {
    id: 'liqpay',
    name: 'LiqPay',
    icon: (
      <Image
        width={40}
        height={40}
        src="https://static.liqpay.ua/buttons/logo-white.svg"
        alt="LiqPay"
        className="w-5 h-5 object-contain"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
    ),
  },
  {
    id: 'novapay',
    name: 'NovaPay',
    disabled: true,
    icon: (
      <Image
        width={40}
        height={40}
        src="/images/novapay-logo.svg"
        alt="NovaPay"
        className="w-5 h-5 object-contain"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
    ),
  },
] as const;
