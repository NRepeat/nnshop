import { SheetContent, SheetHeader, SheetTitle } from '@shared/ui/sheet';
import { CartNoteTextarea } from './CartNoteTextarea';
import CartItem from './Item';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/accordion';
import { Separator } from '@shared/ui/separator';
import { getTranslations } from 'next-intl/server';
import { CreateOrderButton } from './CreateOrderButton';
import getSymbolFromCurrency from 'currency-symbol-map';
import { DiscountCodeInput } from '@features/cart/ui/DiscountCodeInput';

const Content = async ({
  mockProducts,
  currencySymbol,
  cartId,
  locale,
  discountCodes,
  subtotalAmount,
  totalAmount,
  discountAmount,
}: {
  mockProducts: {
    id: string;
    title: string;
    price: string;
    size: string;
    handle: string;
    totalPrice: string;
    quantity: number;
    color: string;
    image: string;
    sale: string;
  }[];
  cartId: string;
  estimateTotal: number;
  currencySymbol: string;
  locale: string;
  discountCodes: Array<{ code: string; applicable: boolean }>;
  subtotalAmount: number;
  totalAmount: number;
  discountAmount: number;
}) => {
  const t = await getTranslations({
    locale,
    namespace: 'Header.cart.drawer',
  });
  return (
    <SheetContent className="w-full sm:min-w-[500px] font-light " >
      <div className="h-full overflow-hidden flex flex-col">
        <SheetHeader className="pt-6 pb-2 px-4">
          <SheetTitle className="font-sans">{t('title')}</SheetTitle>
        </SheetHeader>
        {/* <SheetHeader className="sticky top-0">
          <SheetTitle>{t('title')}</SheetTitle>
        </SheetHeader> */}
        <div className="overflow-auto flex-1">
          <div className="flex flex-col space-y-2 px-4">
            <div
              className="flex flex-col  sticky top-0 bg-background z-20
            "
            >
              <div className="flex justify-between bg-background pb-2">
                <span className="capitalize">{t('product')}</span>
                <span className="capitalize">{t('total')}</span>
              </div>
              <Separator />
            </div>
            {mockProducts.map((product) => (
              <CartItem
                key={product.id + product.title}
                product={product}
                cartId={cartId}
                itemId={product.id}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between py-4  ">
          <Separator />
          <Accordion type="single" collapsible className="w-full px-4">
            <AccordionItem value="item-1" defaultChecked={false}>
              <AccordionTrigger className="w-full">
                <span className="font-light">{t('order_instraction')}</span>
              </AccordionTrigger>
              <AccordionContent className="w-full px-1 pt-1">
                <CartNoteTextarea placeholder={t('order_instraction_placeholder')} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" defaultChecked={false}>
              <AccordionTrigger className="w-full">
                <span className="font-light">{t('promo_code')}</span>
              </AccordionTrigger>
              <AccordionContent className="w-full px-1 pt-1">
                <DiscountCodeInput discountCodes={discountCodes} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Separator />
        </div>
        <div className="w-full flex flex-col gap-2 px-4 py-4">
          {/* <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('subtotal')}</span>
            <span className="">
              {getSymbolFromCurrency(currencySymbol)} {subtotalAmount.toFixed(0)}
            </span>
          </div> */}
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('discount')}</span>
              <span className="text-green-600 dark:text-green-400">
                -{getSymbolFromCurrency(currencySymbol)} {discountAmount.toFixed(0)}
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-medium">
            <span>{t('total')}</span>
            <span className="">
              {getSymbolFromCurrency(currencySymbol)} {totalAmount.toFixed(0)}
            </span>
          </div>
        </div>
        <CreateOrderButton />
      </div>
    </SheetContent>
  );
};
export default Content;
