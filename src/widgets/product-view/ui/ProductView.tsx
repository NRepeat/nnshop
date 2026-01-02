import Gallery from '@features/product/ui/Gallery';
import {
  ProductVariant,
  Product as ShopifyProduct,
} from '@shared/lib/shopify/types/storefront.types';
import { PAGE_QUERYResult } from '@shared/sanity/types';
import { Session, User } from 'better-auth';
import { Button } from '@shared/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/accordion';
import Link from 'next/link';
import { ProductCardSPP } from '@entities/product/ui/ProductCardSPP';
import { cn } from '@shared/lib/utils';

export const colorMap: { [key: string]: string } = {
  Бежевий: 'bg-[#F5F5DC]',
  Блакитний: 'bg-[#87CEEB]',
  Бордовий: 'bg-[#800000]',
  Бронзовий: 'bg-[#CD7F32]',
  Білий: 'bg-[#FFFFFF]',
  Жовтий: 'bg-[#FFFF00]',
  Зелений: 'bg-[#008000]',
  Золото: 'bg-[#FFD700]',
  Коричневий: 'bg-[#A52A2A]',
  "М'ятний": 'bg-[#98FF98]',
  Мультиколор: 'bg-gradient-to-r from-red-500 to-blue-500',
  Помаранчевий: 'bg-[#FFA500]',
  Пітон: 'bg-gray-500',
  Рожевий: 'bg-[#FFC0CB]',
  Рудий: 'bg-[#D2691E]',
  Синій: 'bg-[#0000FF]',
  Срібло: 'bg-[#C0C0C0]',
  Сірий: 'bg-[#808080]',
  Фіолетовий: 'bg-[#8A2BE2]',
  Хакі: 'bg-[#F0E68C]',
  Червоний: 'bg-[#FF0000]',
  Чорний: 'bg-[#000000]',
};

export async function ProductView({
  product,
  selectedVariant,
  relatedProducts,
}: {
  product: ShopifyProduct;
  selectedVariant: ProductVariant | undefined;
  //@ts-ignore
  content: PAGE_QUERYResult['content'];
  sanityDocumentId: string;
  sanityDocumentType: string;
  session: { session: Session; user: User };
  isQuickView?: boolean;
  relatedProducts: ShopifyProduct[];
}) {
  if (!product) throw new Error('Product not found');
  const images = product.images.edges.map((edge) => edge.node).filter(Boolean);
  const colorOptions = product.options.find(
    (option) => option.name.toLowerCase() === 'Колір'.toLowerCase(),
  )?.values;
  const sizeOptions = product.options.find(
    (option) => option.name.toLowerCase() === 'Розмір'.toLowerCase(),
  )?.values;
  return (
    <div className="container mx-auto py-12 space-y-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Gallery
          images={images}
          productId={product.id}
          isFavorite={false}
          //@ts-ignore
          selectedVariant={selectedVariant}
        />
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-medium">{product.title}</h2>
              <p className="text-xl mt-2">
                {Number(product.priceRange.maxVariantPrice.amount).toFixed(0)}{' '}
                {product.priceRange.maxVariantPrice.currencyCode}
              </p>
            </div>
            <Link href="/shop" className="text-sm underline">
              Shop / Clothing
            </Link>
          </div>
          <p className="mt-4 text-gray-700">{product.description}</p>
          <div className="mt-6">
            <span className="text-sm font-medium">
              Product Color:{' '}
              <span className="text-gray-500">
                {selectedVariant?.title.split(' / ')[1]}
              </span>
            </span>
          </div>
          {colorOptions && (
            <div className="mt-2">
              <h3 className="text-sm sr-only">Color</h3>
              <div className="flex gap-2 mt-1">
                {colorOptions.map((color) => (
                  <Button
                    key={color}
                    variant="outline"
                    size="icon"
                    className="rounded-full w-8 h-8"
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full border',
                        colorMap[color],
                      )}
                    />
                  </Button>
                ))}
              </div>
            </div>
          )}
          {sizeOptions && (
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Product Size:</h3>
                <Link href="#" className="text-sm underline">
                  Size Chart
                </Link>
              </div>
              <div className="flex gap-2 mt-1">
                {sizeOptions.map((size) => (
                  <Button key={size} variant="outline">
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6">
            <Button className="w-full bg-black text-white hover:bg-gray-800">
              Add to Bag
            </Button>
          </div>
          <Accordion type="single" collapsible className="w-full mt-6">
            <AccordionItem value="item-1">
              <AccordionTrigger>Check In-Store Availability</AccordionTrigger>
              <AccordionContent>
                Yes, it is available in all stores.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Fit Details</AccordionTrigger>
              <AccordionContent>
                The model is 5'9" and wearing a size Small.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Fabrication & Care</AccordionTrigger>
              <AccordionContent>
                Made from 100% organic cotton. Machine wash cold.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Shipping & Returns</AccordionTrigger>
              <AccordionContent>
                Free shipping on orders over $50. Free returns.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-medium text-center mb-8">Style With</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {relatedProducts.slice(0, 3).map((p) => (
            <ProductCardSPP product={p} key={p.id} />
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-medium text-center mb-8">
          Recently Viewed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {relatedProducts.slice(3, 6).map((p) => (
            <ProductCardSPP product={p} key={p.id} />
          ))}
        </div>
      </div>
      {/*{!isQuickView && (
        <PageBuilder
          content={content}
          documentId={sanityDocumentId}
          documentType={sanityDocumentType}
        />
      )}*/}
    </div>
  );
}
