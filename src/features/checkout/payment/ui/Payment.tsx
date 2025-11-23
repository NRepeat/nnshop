'use client';
import { headers } from 'next/headers';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { getCart } from '@entities/cart/api/get';
import PaymentForm from './PaymentForm';
import { getPaymentInfo } from '../api/getPaymentInfo';
import { generateOrderId } from '../api/generateOrderId';
import { getCompleteCheckoutData } from '@features/checkout/api/getCompleteCheckoutData';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Payment() {
  const [orderId, setOrderId] = useState('');
  const [liqpayPublicKey, setLiqpayPublicKey] = useState('');
  const [liqpayPrivateKey, setLiqpayPrivateKey] = useState('');
  const [existingPaymentInfo, setExistingPaymentInfo] = useState(null);
  const [cartAmount, setCartAmount] = useState(0);
  const [currency, setCurrency] = useState('UAH');
  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const generatedOrderId = await generateOrderId();
      setOrderId(generatedOrderId);

      setLiqpayPublicKey(process.env.LIQPAY_PUBLIC_KEY || '');
      setLiqpayPrivateKey(process.env.LIQPAY_PRIVATE_KEY || '');

      try {
        const paymentInfo = await getPaymentInfo();
        setExistingPaymentInfo(paymentInfo);
      } catch (error) {
        console.error('Error fetching payment info:', error);
      }

      try {
        const data = await getCompleteCheckoutData();
        setCheckoutData(data);

        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
          throw new Error('Session not found');
        }
        const sessionCart = await prisma.cart.findUnique({
          where: {
            userId: session.user.id,
          },
        });
        if (!sessionCart) {
          return redirect('/');
        }
        const cartResult = await getCart(sessionCart.cartToken);
        if (cartResult && cartResult.cart?.cost?.totalAmount) {
          setCartAmount(parseFloat(cartResult.cart.cost.totalAmount.amount));
          setCurrency(cartResult.cart.cost.totalAmount.currencyCode);
        }
      } catch (error) {
        console.error('Error fetching cart data:', error);
        setCartAmount(0);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment</h1>
        <p className="text-gray-600">
          Complete your order with secure payment processing
        </p>
      </div>

      <PaymentForm
        defaultValues={existingPaymentInfo}
        orderId={orderId}
        amount={cartAmount}
        currency={currency}
        liqpayPublicKey={liqpayPublicKey}
        liqpayPrivateKey={liqpayPrivateKey}
        checkoutData={checkoutData}
      />
    </div>
  );
}
