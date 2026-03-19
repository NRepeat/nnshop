'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { usePostHog } from 'posthog-js/react';
import { DEFAULT_CURRENCY_CODE } from '@shared/config/shop';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import addToCart from '../api/add-to-cart';
import { ProductVariant } from '@shared/lib/shopify/types/storefront.types';
import { Product } from '@shared/types/product/types';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { authClient } from '@features/auth/lib/auth-client';
import { useCartUIStore } from '@shared/store/use-cart-ui-store';
import { useRouter } from 'next/navigation';

function SubmitButton({
  variant = 'default',
  disabled,
  pending,
  isProductAvailable,
}: {
  variant?: string;
  disabled: boolean;
  pending: boolean;
  isProductAvailable: boolean;
}) {
  const t = useTranslations('ProductPage');

  let buttonText = t('addToCart');
  if (pending) {
    buttonText = t('addingToCart');
  } else if (isProductAvailable) {
    buttonText = t('outOfStock');
  }

  return (
    <Button
      type="submit"
      //@ts-expect-error
      variant={variant}
      className="w-full h-10 md:h-14 text-md rounded"
      disabled={disabled || pending}
      aria-disabled={pending}
    >
      {buttonText}
    </Button>
  );
}

export function AddToCartButton({
  product,
  selectedVariant,
  className,
  variant,
  disabled,
  onSuccess,
}: {
  product: Product;
  selectedVariant?: ProductVariant;
  className?: string;
  variant?: string;
  disabled?: boolean;
  onSuccess?: () => void;
}) {
  const posthog = usePostHog();
  const [isPending, setIsPending] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();
  const [pendingActions, setPendingActions] = useState(false);
  const scrollYRef = useRef(0);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const router = useRouter();
  const t = useTranslations('ProductPage');
  const { openCart } = useCartUIStore();

  useEffect(() => {
    if (!isRefreshing && pendingActions) {
      window.scrollTo({ top: scrollYRef.current, behavior: 'instant' });
      openCart();
      onSuccessRef.current?.();
      setPendingActions(false);
    }
  }, [isRefreshing, pendingActions, openCart]);

  const isProductAvailable = selectedVariant
    ? selectedVariant?.quantityAvailable !== 0
    : //@ts-ignore
      product?.totalInventory !== 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isProductAvailable && !selectedVariant) {
      toast.warning(t('variantNotSelected')+"!",{style:{justifyContent:"center",backgroundColor:"#FFF4E5",color:"#B98900",border:"1px solid #FFCC47"}});
      return
    }
    if (!isProductAvailable) {
      toast.error(t('productNotAvailable'));
      return;
    }

    setIsPending(true);

    try {
      const { data: session } = await authClient.getSession();

      if (!session?.user) {
        const result = await authClient.signIn.anonymous();

        if (!result.data) {
          toast.error(t('sessionCreationFailed'));
          setIsPending(false);
          return;
        }
      }

      const variantId = selectedVariant
        ? selectedVariant.id
        : product?.variants.edges[0].node.id;

      const formData = new FormData();
      formData.append('variantId', variantId!);
      formData.append('productTitle', product?.title ?? '');
      formData.append('productHandle', product?.handle ?? '');
      formData.append('price', selectedVariant?.price?.amount ?? product?.priceRange?.maxVariantPrice?.amount ?? '');
      formData.append('currency', selectedVariant?.price?.currencyCode ?? product?.priceRange?.maxVariantPrice?.currencyCode ?? DEFAULT_CURRENCY_CODE);
      formData.append('size', selectedVariant?.selectedOptions?.find(o => ['розмір','размер','size'].includes(o.name.toLowerCase()))?.value ?? '');
      formData.append('$current_url', window.location.href);

      const result = await addToCart(null, formData);

      if (result.success) {
        posthog?.capture('add_to_cart', {
          product_handle: product?.handle,
          product_title: product?.title,
          product_id: product?.id,
          variant_id: selectedVariant?.id,
          size: selectedVariant?.selectedOptions?.find(o => ['розмір', 'размер', 'size'].includes(o.name.toLowerCase()))?.value ?? null,
          price: selectedVariant?.price?.amount ?? product?.priceRange?.maxVariantPrice?.amount,
          currency: selectedVariant?.price?.currencyCode ?? product?.priceRange?.maxVariantPrice?.currencyCode,
          $current_url: window.location.href,
        });
        toast.success(t('addedToCart'));
        scrollYRef.current = window.scrollY;
        setPendingActions(true);
        startRefresh(() => {
          router.refresh();
        });
      } else {
        const errorMessage =
          result.message === 'No products available'
            ? t('productNotAvailable')
            : result.message || t('failedToAdd');
        toast.error(errorMessage);
        posthog?.capture('add_to_cart_failed', {
          product_handle: product?.handle,
          variant_id: selectedVariant?.id,
          reason: result.message,
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(t('failedToAdd'));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <input
        type="hidden"
        name="variantId"
        value={
          selectedVariant
            ? selectedVariant.id
            : product?.variants.edges[0].node.id
        }
      />
      <div className={clsx('product-form__buttons mt-1 md:mt-4', className)}>
        <SubmitButton
          variant={variant}
          disabled={!isProductAvailable || (disabled ?? false)}
          isProductAvailable={!isProductAvailable}
          pending={isPending}
        />
      </div>
    </form>
  );
}
