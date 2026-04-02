import { SheetTrigger } from '@shared/ui/sheet';
import { EmptyState } from './EmptyState';
import Content from './Content';
import { ShoppingCart } from 'lucide-react';
import { getCart } from '@entities/cart/api/get';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import { GetCartQuery } from '@shared/lib/shopify/types/storefront.generated';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { DISCOUNT_METAFIELD_KEY } from '@shared/config/shop';
import { sanityFetch } from '@shared/sanity/lib/sanityFetch';
import { HEADER_QUERY } from '@shared/sanity/lib/query';
import { GA4ViewCartEvent } from '@shared/lib/analytics/GA4ViewCartEvent';

const CartSheet = async ({ locale }: { locale: string }) => {
  const [session, headerData] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    sanityFetch({
      query: HEADER_QUERY,
      params: { locale },
      tags: ['siteSettings'],
    }),
  ]);

  const cart = session?.user?.id
    ? ((await getCart({
        userId: session.user.id,
        locale,
      })) as GetCartQuery | null)
    : null;
  const cartId = cart?.cart?.id;
  const SIZE_NAMES = ['розмір', 'размер', 'size'];

  const items = cart?.cart?.lines.edges.map((item) => {
    const product = item.node.merchandise.product;

    // Get sale percentage from metafield
    const sale = Number(
      product.metafields.find((m) => m?.key === DISCOUNT_METAFIELD_KEY)?.value || '0',
    ) || 0;

    // Get original price from cart
    const originalPrice = Number(item.node.cost.amountPerQuantity.amount);
    const quantity = item.node.quantity;

    // Calculate discounted price
    const discountedPrice = sale > 0 ? originalPrice * (1 - sale / 100) : originalPrice;
    const totalPrice = discountedPrice * quantity;

    const compareAtAmount = (item.node.cost as any).compareAtAmountPerQuantity?.amount;
    const compareAtPrice = compareAtAmount && Number(compareAtAmount) > originalPrice
      ? Number(compareAtAmount).toString()
      : null;

    return {
      id: item.node.id,
      title: product.title,
      price: originalPrice.toString(),
      compareAtPrice,
      handle: product.handle,
      size: item.node.merchandise.selectedOptions.find(
        (option) => SIZE_NAMES.includes(option.name.toLowerCase()),
      )?.value,
      color: item.node.merchandise.selectedOptions.find(
        (option) => option.name === 'Color',
      )?.value,
      quantity: quantity,
      totalPrice: totalPrice.toString(),
      image: item.node.merchandise?.image
        ? item.node.merchandise.image.url
        : null,
      sale: sale.toString(),
    };
  });
  const currencySymbol =
    cart?.cart?.lines.edges && cart?.cart?.lines.edges.length > 0
      ? cart?.cart?.lines.edges[0].node.cost.totalAmount.currencyCode
      : '';
  const mockProducts = items;
  const estimateTotal = mockProducts?.reduce(
    (acc, item) => acc + Number(item.totalPrice),
    0,
  );
  const totalQuantity = mockProducts?.reduce(
    (acc, item) => acc + Number(item.quantity),
    0,
  );
  const discountCodes = (cart?.cart?.discountCodes || []).filter((d) => d.applicable);

  const subtotalAmount = estimateTotal || 0;
  // cart.cost.totalAmount does not reflect discount codes — use discountAllocations instead
  const cartDiscountTotal = (cart?.cart?.discountAllocations || []).reduce(
    (sum, d) => sum + Number(d.discountedAmount.amount),
    0,
  );
  // Shopify calculates the discount on original prices; derive rate and apply to sale subtotal
  // cartDiscountTotal > 0 covers both code-based and automatic discounts
  const shopifySubtotal = mockProducts?.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) || 0;
  const discountRate = cartDiscountTotal > 0 && shopifySubtotal > 0 ? cartDiscountTotal / shopifySubtotal : 0;
  const discountAmount = subtotalAmount * discountRate;
  const totalAmount = Math.max(0, subtotalAmount - discountAmount);
  const rawTickerText = headerData?.infoBar?.text;
  const tickerText = typeof rawTickerText === 'string' ? rawTickerText : undefined;

  return (
    <>
      <SheetTrigger
        className="cursor-pointer relative"
        asChild
      >
        <Button variant="ghost" size="icon" aria-label="Shopping cart">
          <ShoppingCart className="h-4 w-4" />
          {mockProducts && mockProducts.length > 0 && (
            <Badge
              key={totalQuantity}
              className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums top-0 right-0 absolute animate-[cart-bump_0.3s_ease]"
            >
              {totalQuantity}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <CartWithEmptyState
        locale={locale}
        products={mockProducts}
        estimateTotal={estimateTotal}
        currencySymbol={currencySymbol}
        cartId={cartId}
        discountCodes={discountCodes}
        subtotalAmount={subtotalAmount}
        totalAmount={totalAmount}
        discountAmount={discountAmount}
        discountRate={discountRate}
        tickerText={tickerText}
      />
    </>
  );
};

export default CartSheet;

const CartWithEmptyState = ({
  products,
  estimateTotal = 0,
  currencySymbol,
  cartId,
  locale,
  discountCodes,
  subtotalAmount,
  totalAmount,
  discountAmount,
  discountRate,
  tickerText,
}: {
  products: any;
  currencySymbol: string;
  estimateTotal: number | undefined;
  cartId: string | undefined;
  locale: string;
  discountCodes: Array<{ code: string; applicable: boolean }>;
  subtotalAmount: number;
  totalAmount: number;
  discountAmount: number;
  discountRate: number;
  tickerText?: string;
}) => {
  const ga4Items = (products || []).map((p: any) => ({
    item_id: p.id,
    item_name: p.title,
    price: Number(p.price),
    quantity: p.quantity,
  }));

  if (!cartId || !products || products.length === 0) {
    return <EmptyState locale={locale} />;
  } else {
    return (
      <>
        <GA4ViewCartEvent items={ga4Items} value={totalAmount} currency={currencySymbol} />
        <Content
        mockProducts={products}
        estimateTotal={estimateTotal}
        currencySymbol={currencySymbol}
        cartId={cartId}
        locale={locale}
        discountCodes={discountCodes}
        subtotalAmount={subtotalAmount}
        totalAmount={totalAmount}
        discountAmount={discountAmount}
        discountRate={discountRate}
        tickerText={tickerText}
      />
      </>
    );
  }
};
