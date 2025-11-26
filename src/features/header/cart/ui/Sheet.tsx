import { Sheet, SheetTrigger } from '@shared/ui/sheet';
import { EmptyState } from './EmptyState';
import Content from './Content';
import { ShoppingCart } from 'lucide-react';
import { getCart } from '@entities/cart/api/get';

const CartSheet = async () => {
  const cart = await getCart();
  const cartId = cart?.cart?.id;
  const items = cart?.cart?.lines.edges.map((item) => ({
    id: item.node.id,
    title: item.node.merchandise.product.title,
    price: item.node.cost.amountPerQuantity.amount,
    size: item.node.merchandise.selectedOptions.find(
      (option) => option.name === 'Size',
    )?.value,
    color: item.node.merchandise.selectedOptions.find(
      (option) => option.name === 'Color',
    )?.value,
    quantity: item.node.quantity,
    totalPrice: item.node.cost.totalAmount.amount,
    image: item.node.merchandise?.image
      ? item.node.merchandise.image.url
      : null,
  }));
  const currencySymbol =
    cart?.cart?.lines.edges && cart?.cart?.lines.edges.length > 0
      ? cart?.cart?.lines.edges[0].node.cost.totalAmount.currencyCode
      : '';
  const mockProducts = items;
  const estimateTotal = mockProducts?.reduce(
    (acc, item) => acc + Number(item.totalPrice),
    0,
  );
  return (
    <Sheet>
      <SheetTrigger className="cursor-pointer block hover:bg-accent p-2 rounded-none">
        <ShoppingCart />
      </SheetTrigger>
      <CartWithEmptyState
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
}: {
  products: any;
  currencySymbol: string;
  estimateTotal: number | undefined;
  cartId: string | undefined;
}) => {
  if (!cartId) {
    return <EmptyState />;
  } else {
    return (
      <Content
        mockProducts={products}
        estimateTotal={estimateTotal}
        currencySymbol={currencySymbol}
        cartId={cartId}
      />
    );
  }
};
