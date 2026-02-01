import { CreditCard, PackageCheck, Building2 } from 'lucide-react';
import { PaymentInfo } from '../schema/paymentSchema';

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
    availableMethods: ['bank-transfer'],
    icon: <CreditCard />,
  },
  // {
  //   id: 'pay-later',
  //   name: 'Pay Later',
  //   availableMethods: [],
  //   icon: <DollarSign />,
  // },
] as const;

export const paymentProviders: {
  id: PaymentInfo['paymentProvider'];
  name: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    icon: <Building2 />,
  },
] as const;
