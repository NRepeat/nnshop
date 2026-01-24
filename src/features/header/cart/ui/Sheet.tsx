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
  if (!session) {
    return null;
  }
  const cart = (await getCart({
    userId: session.user.id,
    locale,
  })) as GetCartQuery | null;
  const cartId = cart?.cart?.id;
  const sizeLabel = {
    uk: 'Розмір',
    ru: 'Размер',
    en: 'Size',
  }[locale];

  const items = cart?.cart?.lines.edges.map((item) => {
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
      size: item.node.merchandise.selectedOptions.find(
        (option) => option.name === sizeLabel,
      )?.value,
      color: item.node.merchandise.selectedOptions.find(
        (option) => option.name === 'Color',
      )?.value,
      quantity: item.node.quantity,
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

  return (
    <Sheet>
      <SheetTrigger
        className="cursor-pointer  flex justify-center items-center hover:underline hover:text-accent-foreground  rounded-none relative size-9 "
        asChild
      >
        <Button variant="ghost" size="icon" className="rounded-none">
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
}: {
  products: any;
  currencySymbol: string;
  estimateTotal: number | undefined;
  cartId: string | undefined;
  locale: string;
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
      />
    );
  }
};
