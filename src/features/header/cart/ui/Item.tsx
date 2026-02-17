import { Card, CardContent } from '@shared/ui/card';
import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
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
  const sale = Number(product.sale);
  const t = useTranslations('Header.cart.drawer');

  return (
    <Card className="p-0 shadow-none">
      <Link href={'/product/' + product.handle} className="flex col-span-1">
        <CardContent className="grid grid-cols-[164px_1fr_0.6fr] gap-3  shadow-none relative px-0 pt-4">
          <div className="relative w-36 h-36 shrink-0">
            <Image
              className="object-cover"
              src={product.image}
              alt={product.title}
              fill
              sizes="164px"
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-1 text-sm justify-center">
            <div className="flex flex-col gap-1">
              <p className="text-pretty ">{product.title}</p>
              {product.size && (
                <p>
                  {t('sizeLabel')}
                  {product.size} × {product.quantity}
                </p>
              )}
            </div>
          </div>
          <div className="col-span-1 flex flex-col justify-center">
            <p
              className={cn('justify-items-end text-right', {
                'text-red-500': sale > 0,
              })}
            >
              {Math.round(Number(product.totalPrice))
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              {getSymbolFromCurrency('UAH')}
            </p>
            <div className="absolute top-2 -right-0.5 mr-1 mt-1 z-10">
              <RemoveItemButton cartId={cartId} itemId={itemId} />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
export default CartItem;
