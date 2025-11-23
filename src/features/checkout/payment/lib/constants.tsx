import { CreditCard, DollarSign, PackageCheck } from 'lucide-react';
import { PaymentInfo } from '../schema/paymentSchema';

export const paymentMethods: {
  id: PaymentInfo['paymentMethod'];
  name: string;
  availableMethods: string[];
  icon: React.ReactNode;
}[] = [
  {
    id: 'pay-now',
    name: 'Pay Now',
    availableMethods: ['liqpay', 'credit-card', 'paypal', 'stripe'],
    icon: <CreditCard />,
  },
  {
    id: 'after-delivered',
    name: 'After Delivered',
    availableMethods: [],
    icon: <PackageCheck />,
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
    id: 'liqpay',
    name: 'LiqPay',
    icon: <CreditCard />,
  },
  // {
  //   id: 'credit-card',
  //   name: 'Credit Card',
  //   icon: <CreditCard />,
  // },
  // {
  //   id: 'paypal',
  //   name: 'PayPal',
  //   icon: <CreditCard />,
  // },
  // {
  //   id: 'stripe',
  //   name: 'Stripe',
  //   icon: <CreditCard />,
  // },
] as const;
