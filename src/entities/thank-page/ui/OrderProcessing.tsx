'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { cancelShopifyOrder } from '@features/order/api/cancelShopifyOrder';

interface OrderProcessingProps {
  orderId: string;
  prismaOrderId: string;
  shopifyOrderId: string;
  locale: string;
  timeoutMs?: number;
}

/**
 * Polls /api/checkout/order-status every 2s waiting for LiqPay callback
 * to flip draft → false. If confirmed, refreshes the server component.
 * If timeout reached (default 30s), cancels the order and redirects to payment.
 */
export function OrderProcessing({
  orderId,
  prismaOrderId,
  shopifyOrderId,
  locale,
  timeoutMs = 30_000,
}: OrderProcessingProps) {
  const router = useRouter();
  const cancelledRef = useRef(false);

  useEffect(() => {
    let stopped = false;

    const poll = async () => {
      const start = Date.now();

      while (!stopped && Date.now() - start < timeoutMs) {
        await new Promise((r) => setTimeout(r, 2000));
        if (stopped) break;

        try {
          const res = await fetch(`/api/checkout/order-status?orderId=${encodeURIComponent(orderId)}`);
          const json = await res.json();

          if (json.confirmed) {
            router.refresh();
            return;
          }

          if (json.notFound) {
            // order was deleted (e.g. concurrent cancel) — go back to payment
            router.replace(`/${locale}/checkout/payment`);
            return;
          }
        } catch {
          // network error — keep retrying
        }
      }

      // Timeout — payment not confirmed, cancel & redirect
      if (!stopped && !cancelledRef.current) {
        cancelledRef.current = true;
        try {
          await cancelShopifyOrder(prismaOrderId, shopifyOrderId);
        } catch {
          // non-blocking
        }
        router.replace(`/${locale}/checkout/payment`);
      }
    };

    poll();
    return () => {
      stopped = true;
    };
  }, [orderId, prismaOrderId, shopifyOrderId, locale, router, timeoutMs]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <Loader2 className="size-8 animate-spin text-gray-400" />
      <p className="text-sm text-gray-500">Обробляємо ваш платіж…</p>
    </div>
  );
}
