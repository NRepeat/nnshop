import { Sheet, SheetTrigger } from '@shared/ui/sheet';
import { EmptyState } from './EmptyState';
import Content from './Content';
import { getCart } from '@features/cart/api/get';
import { ShoppingCart } from 'lucide-react';

const CartSheet = async () => {
  const cart = await getCart();
  const items = cart?.cart?.lines.edges.map((item) => ({
    title: item.node.merchandise.product.title,
    price: item.node.cost.totalAmount.amount,
    size: item.node.merchandise.selectedOptions[0].value,
    color: item.node.merchandise.selectedOptions[1]
      ? item.node.merchandise.selectedOptions[1].value
      : '',
    image: item.node.merchandise?.image
      ? item.node.merchandise.image.url
      : null,
  }));
  const mockProducts = items;

  return (
    <Sheet>
      <SheetTrigger className="cursor-pointer block hover:bg-accent p-2 rounded-none">
        <ShoppingCart />
      </SheetTrigger>
      <CartWithEmptyState products={mockProducts} test />
    </Sheet>
  );
};

export default CartSheet;

const CartWithEmptyState = ({
  test,
  products,
}: {
  test: boolean;
  products: any;
}) => {
  if (!test) {
    return <EmptyState />;
  } else {
    return <Content mockProducts={products} />;
  }
};
