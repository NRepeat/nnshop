import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shared/ui/sheet';
import { getTranslations } from 'next-intl/server';
import CartIcon from '@shared/assets/CartIcon';
import { Button } from '@shared/ui/button';
import { ChevronDown, ShoppingCart } from 'lucide-react';
import { Separator } from '@shared/ui/separator';
import CartItem from './Item';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/accordion';
import { Textarea } from '@shared/ui/textarea';
import { EmptyState } from './EmptyState';
import Content from './Content';

const CartSheet = async () => {
  const mockProducts = [
    {
      title: 'SS 2001 Elizabeth Taylor Silk Dress',
      price: '$2,000.00',
      size: 'L',
      color: 'Blue',
      image:
        'https://justinreed.com/cdn/shop/files/DSC08368.jpg?v=1761153431&width=300',
    },
    {
      title: 'SS 2001 Elizabeth Taylor Silk Dress',
      price: '$2,000.00',
      size: 'L',
      color: 'Blue',
      image:
        'https://justinreed.com/cdn/shop/files/DSC08368.jpg?v=1761153431&width=300',
    },
    {
      title: 'SS 2001 Elizabeth Taylor Silk Dress',
      price: '$2,000.00',
      size: 'L',
      color: 'Blue',
      image:
        'https://justinreed.com/cdn/shop/files/DSC08368.jpg?v=1761153431&width=300',
    },
    {
      title: 'SS 2001 Elizabeth Taylor Silk Dress',
      price: '$2,000.00',
      size: 'L',
      color: 'Blue',
      image:
        'https://justinreed.com/cdn/shop/files/DSC08368.jpg?v=1761153431&width=300',
    },
    {
      title: 'SS 2001 Elizabeth Taylor Silk Dress',
      price: '$2,000.00',
      size: 'L',
      color: 'Blue',
      image:
        'https://justinreed.com/cdn/shop/files/DSC08368.jpg?v=1761153431&width=300',
    },
    {
      title: 'SS 2001 Elizabeth Taylor Silk Dress',
      price: '$2,000.00',
      size: 'L',
      color: 'Blue',
      image:
        'https://justinreed.com/cdn/shop/files/DSC08368.jpg?v=1761153431&width=300',
    },
    {
      title: 'SS 2001 Elizabeth Taylor Silk Dress',
      price: '$2,000.00',
      size: 'L',
      color: 'Blue',
      image:
        'https://justinreed.com/cdn/shop/files/DSC08368.jpg?v=1761153431&width=300',
    },
    {
      title: 'SS 2001 Elizabeth Taylor Silk Dress',
      price: '$2,000.00',
      size: 'L',
      color: 'Blue',
      image:
        'https://justinreed.com/cdn/shop/files/DSC08368.jpg?v=1761153431&width=300',
    },
    {
      title: 'SS 2001 Elizabeth Taylor Silk Dress',
      price: '$2,000.00',
      size: 'L',
      color: 'Blue',
      image:
        'https://justinreed.com/cdn/shop/files/DSC08368.jpg?v=1761153431&width=300',
    },
  ];

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
