'use client';

import { useEffect } from 'react';
import { Sheet } from '@shared/ui/sheet';
import { useCartUIStore } from '@shared/store/use-cart-ui-store';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface CartSheetControllerProps {
  locale: string;
  children: React.ReactNode;
}

export const CartSheetController = ({ children }: CartSheetControllerProps) => {
  const { isOpen, openCart, closeCart } = useCartUIStore();

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_cart');
    }
  }, [isOpen]);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          openCart();
        } else closeCart();
      }}
    >
      {children}
    </Sheet>
  );
};
