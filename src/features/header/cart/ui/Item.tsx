import { Card, CardContent } from '@shared/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { RemoveItemButton } from './RemoveItemButton';
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
  //   const sizeOptions = product.options.find(
  //   (option) => option.name.toLowerCase() === 'Розмір'.toLowerCase(),
  // )?.values;
  const sale = Number(product.sale);
  const price = Number(product.price);
  const discountedPrice = price - (price * sale) / 100;
  const t = useTranslations('Header.cart.drawer');
  return (
    <Card className="p-0 rounded-none shadow-none ">
      <Link href={'/product/' + product.handle} className="flex col-span-1">
        <CardContent className="grid grid-cols-[1fr_1fr_0.6fr] justify-between   rounded-none shadow-none relative  p-1">
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
              <p>
                {sale > 0 ? (
                  <>
                    <span className="line-through">
                      {price.toFixed()}
                      {getSymbolFromCurrency('UAH')}
                    </span>
                    <span className="text-red-500 ml-2">
                      {discountedPrice.toFixed()}
                    </span>
                  </>
                ) : (
                  price.toFixed()
                )}
                {sale > 0}
                <span className={cn({ 'text-red-500': sale > 0 })}>
                  {getSymbolFromCurrency('UAH')}{' '}
                </span>
                x {product.quantity}
              </p>
             {product.size && <p>{t('sizeLabel')}{product.size}</p>}
            </div>
          </div>
          <div className="col-span-1 flex flex-col justify-center">
            <p className="justify-items-end text-right  ">
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
