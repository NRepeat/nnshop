import { Card, CardContent } from '@shared/ui/card';
import Image from 'next/image';
import Link from 'next/link';

const CartItem = ({
  product,
}: {
  product: {
    title: string;
    price: string;
    size: string;
    color: string;
    image: string;
  };
}) => {
  return (
    <Card className="p-0 rounded-none shadow-none ">
      <CardContent className="grid grid-cols-7 justify-between  p-0 rounded-none shadow-none">
        <Link href={''} className="flex col-span-2">
          <Image
            className="w-full h-auto"
            src={product.image}
            alt={product.title}
            width={120}
            height={100}
          />
        </Link>
        <div className="flex flex-col gap-1.5 col-span-3 ml-4 text-sm justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-pretty ">{product.title}</p>
            <p>{product.price}</p>
            <p>Size:{product.size}</p>
            <p>Color:{product.color}</p>
          </div>
          <p className="hover:underline cursor-pointer">Remove</p>
        </div>
        <p className="justify-items-end text-right  col-span-2 ">
          {product.price}
        </p>
      </CardContent>
    </Card>
  );
};
export default CartItem;
