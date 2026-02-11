import { Card, CardContent } from '@shared/ui/card';
import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';import { RemoveItemButton } from './RemoveItemButton';
import getSymbolFromCurrency from 'currency-symbol-map';
import { cn } from '@shared/lib/utils';
import { useTranslations } from 'next-intl';

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
    sale: string;
    handle: string;
  };
  cartId: string;
  itemId: string;
}) => {
  const sale = Number(product.sale);
  const originalPrice = Number(product.price);
  const t = useTranslations('Header.cart.drawer');

  // Calculate discounted price
  const discountedPrice = sale > 0 ? originalPrice * (1 - sale / 100) : originalPrice;

  return (
    <Card className="p-0 shadow-none">
      <Link href={'/product/' + product.handle} className="flex col-span-1">
        <CardContent className="grid grid-cols-[1fr_1fr_0.6fr] justify-between shadow-none relative p-1">
          <Image
            className="w-full h-auto object-cover"
            src={product.image}
            alt={product.title}
            width={120}
            height={100}
          />
          <div className="flex flex-col gap-1.5 col-span-1 ml-4  items-center text-base justify-center">
            <div className="flex flex-col gap-1">
              <p className="text-pretty ">{product.title}</p>
             {product.size && <p>{t('sizeLabel')}{product.size} × {product.quantity}</p>}
            </div>
          </div>
          <div className="col-span-1 flex flex-col justify-center">
            <p className={cn('justify-items-end text-right', { 'text-red-500': sale > 0 })}>
              {Number(product.totalPrice).toFixed()}
              {getSymbolFromCurrency('UAH')}
            </p>
            <div className="absolute top-0 right-0 mr-1 mt-1 z-10">
              <RemoveItemButton cartId={cartId} itemId={itemId} />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
export default CartItem;
