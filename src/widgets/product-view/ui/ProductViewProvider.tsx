'use client';
import { useQueryState } from 'nuqs';
import Gallery from '@features/product/ui/Gallery';
import { Product as ShopifyProduct } from '@shared/lib/shopify/types/storefront.types';
import { ProductInfo } from './ProductInfo';
import { ProductMEtaobjectType } from '@entities/metaobject/api/get-metaobject';

export function ProductViewProvider({
  product,
  boundProducts,
  attributes,
  favCommponent,
}: {
  product: ShopifyProduct;
  boundProducts: ShopifyProduct[];
  attributes: ProductMEtaobjectType[];
  favCommponent: React.ReactNode;
}) {
  // const t = useTranslations('ProductPage');
  if (!product) throw new Error('Product not found');
  const images = product.images.edges.map((edge) => edge.node).filter(Boolean);
  const colorOptions = product.options.find(
    (option) => option.name.toLowerCase() === 'Колір'.toLowerCase(),
  )?.values;
  const boundProductColorOptions = boundProducts.filter((product) =>
    product.options.find(
      (option) => option.name.toLowerCase() === 'Колір'.toLowerCase(),
    ),
  );
  const sizeOptions = product.options.find(
    (option) => option.name.toLowerCase() === 'Розмір'.toLowerCase(),
  )?.values;

  const [size, setSize] = useQueryState('size');
  let selectedVariant = undefined;

  if (size) {
    selectedVariant = product.variants.edges.find((edge) => {
      const variant = edge.node;
      console.log(variant.selectedOptions, 'selectedOptions');
      const sizeMatch = variant.selectedOptions.find(
        (option) =>
          option.name.toLowerCase() === 'Розмір'.toLowerCase() &&
          option.value.toLowerCase() === (size ?? ''),
      );
      return sizeMatch;
    })?.node;
  }
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_0.7fr_1.3fr] gap-6 lg:gap-12 ">
        <Gallery images={images} productId={product.id} handle={product.handle}>
          {favCommponent}
        </Gallery>
        <ProductInfo
          product={product}
          colorOptions={colorOptions}
          sizeOptions={sizeOptions}
          selectedVariant={selectedVariant}
          setSize={setSize}
          boundProduct={boundProductColorOptions}
          size={size ?? ''}
          attributes={attributes}
        />
      </div>
    </>
  );
}
