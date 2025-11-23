export const paymentMethods = [
  {
    id: 'pay-now',
    name: 'Pay Now',
    availableMethods: ['liqpay', 'credit-card', 'paypal', 'stripe'],
  },
  { id: 'after-delivered', name: 'After Delivered', availableMethods: [] },
  { id: 'pay-later', name: 'Pay Later', availableMethods: [] },
];

export const paymentProviders = [
  {
    id: 'liqpay',
    name: 'LiqPay',
  },
  {
    id: 'credit-card',
    name: 'Credit Card',
  },
  {
    id: 'paypal',
    name: 'PayPal',
  },
  {
    id: 'stripe',
    name: 'Stripe',
  },
];
