import { Card, CardContent } from '@shared/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { RemoveItemButton } from './RemoveItemButton';

const CartItem = ({
  product,
  cartId,
  itemId,
}: {
  product: {
    title: string;
    totalPrice: string;
    quantity: number;
    price: string;
    size: string;
    color: string;
    image: string;
  };
  cartId: string;
  itemId: string;
}) => {
  return (
    <Card className="p-0 rounded-none shadow-none ">
      <CardContent className="grid grid-cols-7 justify-between  p-0 rounded-none shadow-none relative">
        <Link href={''} className="flex col-span-2">
          <Image
            className="w-full h-auto object-cover"
            src={product.image}
            alt={product.title}
            width={120}
            height={100}
          />
        </Link>
        <div className="flex flex-col gap-1.5 col-span-3 ml-4 text-sm justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-pretty ">{product.title}</p>
            <p>
              {product.price} x {product.quantity}
            </p>
            {product.size && <p>Size:{product.size}</p>}
            {product.color && <p>Color:{product.color}</p>}
          </div>
        </div>
        <p className="justify-items-end text-right  col-span-2 ">
          {product.totalPrice}
        </p>
        <div className="absolute top-0 right-0 mr-1 mt-1">
          <RemoveItemButton cartId={cartId} itemId={itemId} />
        </div>
      </CardContent>
    </Card>
  );
};
export default CartItem;
