import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { getCart } from '@entities/cart/api/get';
import { GetCartQuery } from '@shared/lib/shopify/types/storefront.generated';
import { Breadcrumbs } from '@shared/ui/breadcrumbs';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { locales } from '@shared/i18n/routing';
import { CartPageContent } from '@features/cart/ui/CartPage';
import { CartPageSkeleton } from '@features/cart/ui/CartPageSkeleton';
import { EmptyCartState } from '@features/cart/ui/EmptyCartState';

export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    params.push({ locale: locale });
  }
  return params;
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={<CartPageSkeleton />}>
      <CartPageSession params={params} />
    </Suspense>
  );
}

const CartPageSession = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const tHeader = await getTranslations({ locale, namespace: 'Header.nav' });
  const t = await getTranslations({ locale, namespace: 'CartPage' });
  let session = await auth.api.getSession({ headers: await headers() });

  const breadcrumbItems = [
    { label: tHeader('home'), href: '/' },
    { label: t('title'), href: '/cart', isCurrent: true },
  ];

  // Create anonymous session if no session exists
  if (!session || !session.user) {
    try {
      await auth.api.signInAnonymous({ headers: await headers() });
      session = await auth.api.getSession({ headers: await headers() });
    } catch (error) {
      console.error('Failed to create anonymous session:', error);
    }
  }

  // If still no session after trying to create one, show empty cart
  if (!session || !session.user) {
    return (
      <div className="container mx-auto py-10 mt-2 md:mt-10 min-h-[60vh]">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-2xl font-bold my-4">{t('title')}</h1>
        <EmptyCartState />
      </div>
    );
  }

  const cart = (await getCart({
    userId: session.user.id,
    locale,
  })) as GetCartQuery | null;

  if (!cart?.cart || !cart.cart.lines.edges.length) {
    return (
      <div className="container mx-auto py-10 mt-2 md:mt-10 min-h-[60vh]">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-2xl font-bold my-4">{t('title')}</h1>
        <EmptyCartState />
      </div>
    );
  }

  const sizeLabel = {
    uk: 'Розмір',
    ru: 'Розмір',
    en: 'Розмір',
  }[locale] || 'Розмір';

  const items = cart.cart.lines.edges.map((item) => {
    const product = item.node.merchandise.product;
    const sale =
      Number(
        product.metafields.find((m) => m?.key === 'znizka')?.value || '0',
      ) || 0;
    const price = Number(item.node.cost.amountPerQuantity.amount);
    const quantity = item.node.quantity;
    const discountedPrice = price - (price * sale) / 100;
    const totalPrice = sale > 0 ? discountedPrice * quantity : price * quantity;

    return {
      id: item.node.id,
      title: product.title,
      price: item.node.cost.amountPerQuantity.amount,
      handle: product.handle,
      size:
        item.node.merchandise.selectedOptions.find(
          (option) => option.name === sizeLabel,
        )?.value || '',
      color:
        item.node.merchandise.selectedOptions.find(
          (option) => option.name === 'Color',
        )?.value || '',
      quantity: item.node.quantity,
      totalPrice: totalPrice.toString(),
      image: item.node.merchandise?.image
        ? item.node.merchandise.image.url
        : '',
      sale: sale.toString(),
    };
  });

  const currencySymbol =
    cart.cart.lines.edges.length > 0
      ? cart.cart.lines.edges[0].node.cost.totalAmount.currencyCode
      : 'UAH';

  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.totalPrice),
    0,
  );

  const discountCodes = cart.cart.discountCodes || [];
  const cartNote = cart.cart.note || '';

  return (
    <div className="container mx-auto py-10 mt-2 md:mt-10 min-h-[60vh]">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl font-bold my-4">{t('title')}</h1>
      <CartPageContent
        items={items}
        subtotal={subtotal}
        currencySymbol={currencySymbol}
        cartId={cart.cart.id}
        discountCodes={discountCodes}
        cartNote={cartNote}
      />
    </div>
  );
};
