import { Sheet, SheetTrigger } from '@shared/ui/sheet';
import { EmptyState } from './EmptyState';
import Content from './Content';
import { ShoppingCart } from 'lucide-react';
import { getCart } from '@entities/cart/api/get';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import { GetCartQuery } from '@shared/lib/shopify/types/storefront.generated';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';

const CartSheet = async ({ locale }: { locale: string }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  const cart = (await getCart({
    userId: session?.user.id,
    locale,
  })) as GetCartQuery | null;
  const cartId = cart?.cart?.id;
  const sizeLabel = {
    uk: 'Розмір',
    ru: 'Розмір',
    en: 'Розмір',
  }[locale];

  const items = cart?.cart?.lines.edges.map((item) => {
    const product = item.node.merchandise.product;

    // Get sale percentage from metafield
    const sale = Number(
      product.metafields.find((m) => m?.key === 'znizka')?.value || '0',
    ) || 0;

    // Get original price from cart
    const originalPrice = Number(item.node.cost.amountPerQuantity.amount);
    const quantity = item.node.quantity;

    // Calculate discounted price
    const discountedPrice = sale > 0 ? originalPrice * (1 - sale / 100) : originalPrice;
    const totalPrice = discountedPrice * quantity;

    return {
      id: item.node.id,
      title: product.title,
      price: originalPrice.toString(),
      handle: product.handle,
      size: item.node.merchandise.selectedOptions.find(
        (option) => option.name === sizeLabel,
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
  const discountCodes = cart?.cart?.discountCodes || [];

  // Get subtotal and total from Shopify cart
  const subtotalAmount = Number(cart?.cart?.cost?.subtotalAmount?.amount || estimateTotal);
  const totalAmount = Number(cart?.cart?.cost?.totalAmount?.amount || estimateTotal);
  const discountAmount = subtotalAmount - totalAmount;

  return (
    <Sheet >
      <SheetTrigger
        className="cursor-pointer relative"
        asChild
      >
        <Button variant="ghost" size="icon" aria-label="Shopping cart">
          <ShoppingCart className="h-4 w-4" />
          {mockProducts && mockProducts.length > 0 && (
            <Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums top-0 right-0 absolute">
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
      />
    </Sheet>
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
}) => {
  if (!cartId) {
    return <EmptyState locale={locale} />;
  } else {
    return (
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
      />
    );
  }
};
