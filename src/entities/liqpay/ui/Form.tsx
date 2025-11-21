import LiqPay from '../model';

const publicKey = process.env.LIQPAY_PUBLIC_KEY;
const privateKey = process.env.LIQPAY_PRIVATE_KEY;

interface LiqpayProps {
  orderId: string;
  amount: string;
  action: string;
  description?: string;
  currency?: string;
  language?: 'ru' | 'uk' | 'en';
  customerInfo?: {
    name?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  deliveryInfo?: {
    deliveryMethod?: string;
    address?: string;
    city?: string;
    departmentName?: string;
  };
}

export default function Liqpay({
  orderId,
  amount,
  action,
  description = 'Order payment',
  currency = 'USD',
  language = 'en',
  customerInfo,
  deliveryInfo,
}: LiqpayProps) {
  if (!privateKey || !publicKey) {
    throw new Error('LiqPay keys are not configured');
  }

  // Create enhanced description with customer and delivery info
  let enhancedDescription = description;
  if (customerInfo || deliveryInfo) {
    const parts = [description];

    if (customerInfo?.name && customerInfo?.lastName) {
      parts.push(`Клієнт: ${customerInfo.name} ${customerInfo.lastName}`);
    }

    if (customerInfo?.email) {
      parts.push(`Email: ${customerInfo.email}`);
    }

    if (customerInfo?.phone) {
      parts.push(`Телефон: ${customerInfo.phone}`);
    }

    if (
      deliveryInfo?.deliveryMethod === 'novaPoshta' &&
      deliveryInfo?.departmentName
    ) {
      parts.push(`Доставка: Нова Пошта - ${deliveryInfo.departmentName}`);
    } else if (
      deliveryInfo?.deliveryMethod === 'ukrPoshta' &&
      deliveryInfo?.address
    ) {
      parts.push(
        `Доставка: Укрпошта - ${deliveryInfo.address}, ${deliveryInfo.city}`,
      );
    }

    enhancedDescription = parts.join(' | ');
  }

  const liqpay = new LiqPay(publicKey, privateKey);
  const form = liqpay.cnbForm({
    version: 3,
    action: action,
    amount: amount,
    currency: currency,
    description: enhancedDescription,
    order_id: orderId,
    server_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/liqpay/callback`,
    result_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success/${orderId}`,
    language: language,
  });

  return form;
}
