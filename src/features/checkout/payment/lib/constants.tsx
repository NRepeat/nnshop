import { CreditCard, DollarSign, PackageCheck } from 'lucide-react';

export const paymentMethods = [
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
  {
    id: 'pay-later',
    name: 'Pay Later',
    availableMethods: [],
    icon: <DollarSign />,
  },
] as const;

export const paymentProviders = [
  {
    id: 'liqpay',
    name: 'LiqPay',
    icon: <CreditCard />,
  },
  {
    id: 'credit-card',
    name: 'Credit Card',
    icon: <CreditCard />,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <CreditCard />,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    icon: <CreditCard />,
  },
] as const;
