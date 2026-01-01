import Gallery from '@features/product/ui/Gallery';
import { Product } from '@shared/types/product/types';
import { PageBuilder } from '@widgets/page-builder';
import {
  ProductVariant,
  Product as ShopifyProduct,
} from '@shared/lib/shopify/types/storefront.types';
import { PAGE_QUERYResult } from '@shared/sanity/types';
import { Suspense } from 'react';
import { Session, User } from 'better-auth';
import { Button } from '@shared/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/accordion';
import { ProductCarousel } from '@entities/product/ui/ProductCarousel';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductCard } from '@entities/product/ui/ProductCard';

export async function ProductView({
  product,
  selectedVariant,
  content,
  sanityDocumentId,
  sanityDocumentType,
  session,
  isQuickView = false,
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
    (option) => option.name.toLowerCase() === 'color',
  )?.optionValues;
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
          selectedVariant={selectedVariant}
        />
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-medium">{product.title}</h2>
              <p className="text-xl mt-2">
                {product.priceRange.maxVariantPrice.amount}{' '}
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
                    key={color.id}
                    variant="outline"
                    size="icon"
                    className="rounded-full w-8 h-8"
                  >
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: color.name.toLowerCase() }}
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
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-medium text-center mb-8">
          Recently Viewed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {relatedProducts.slice(3, 6).map((p) => (
            <ProductCard product={p} key={p.id} />
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
