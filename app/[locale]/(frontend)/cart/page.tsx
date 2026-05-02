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
  const session = await auth.api.getSession({ headers: await headers() });

  const breadcrumbItems = [
    { label: tHeader('home'), href: '/' },
    { label: t('title'), href: '/cart', isCurrent: true },
  ];

  // No anonymous sign-in on render — bots/scrapers hitting /cart created
  // a User+Session row each. Anonymous session is created on first real
  // action (AddToCartButton). Without a session we just show empty cart.
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

  const SIZE_NAMES = ['розмір', 'размер', 'size'];

  const items = cart.cart.lines.edges.map((item) => {
    const product = item.node.merchandise.product;
    const sale =
      Number(
        product.metafields.find((m) => m?.key === 'znizka')?.value || '0',
      ) || 0;
    const price = Number(item.node.cost.amountPerQuantity.amount);
    const compareAtPrice = (item.node.cost as any).compareAtAmountPerQuantity?.amount
      ? Number((item.node.cost as any).compareAtAmountPerQuantity.amount)
      : null;
    const quantity = item.node.quantity;
    const discountedPrice = price - (price * sale) / 100;
    const totalPrice = sale > 0 ? discountedPrice * quantity : price * quantity;

    return {
      id: item.node.id,
      title: product.title,
      price: item.node.cost.amountPerQuantity.amount,
      compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice.toString() : null,
      handle: product.handle,
      size:
        item.node.merchandise.selectedOptions.find(
          (option) => SIZE_NAMES.includes(option.name.toLowerCase()),
        )?.value || '',
      color:
        item.node.merchandise.selectedOptions.find(
          (option) => option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'колір',
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
