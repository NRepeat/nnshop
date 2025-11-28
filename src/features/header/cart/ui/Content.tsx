import { SheetContent, SheetHeader, SheetTitle } from '@shared/ui/sheet';
import { Textarea } from '@shared/ui/textarea';
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

const Content = async ({
  mockProducts,
  estimateTotal,
  currencySymbol,
  cartId,
}: {
  mockProducts: {
    id: string;
    title: string;
    price: string;
    size: string;
    totalPrice: string;
    quantity: number;
    color: string;
    image: string;
  }[];
  cartId: string;
  estimateTotal: number;
  currencySymbol: string;
}) => {
  const t = await getTranslations('Header.cart.drawer');
  return (
    <SheetContent className="w-full md:min-w-[450px] font-light ">
      <div className="h-full overflow-hidden flex flex-col">
        <SheetHeader className="sticky top-0">
          <SheetTitle>{t('title')}</SheetTitle>
        </SheetHeader>
        <div className="overflow-auto flex-1">
          <div className="flex flex-col space-y-2 px-4">
            <div className="flex flex-col  sticky top-0 ">
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
                <Textarea placeholder={t('order_instraction_placeholder')} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Separator />
        </div>
        <div className="w-full flex justify-between px-4 py-4">
          <span>{t('estimate_total')}</span>
          <span className="">
            {currencySymbol} {estimateTotal}
          </span>
        </div>
        <CreateOrderButton />
      </div>
    </SheetContent>
  );
};
export default Content;
