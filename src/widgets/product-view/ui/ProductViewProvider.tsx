'use client';
import { useQueryState } from 'nuqs';
import { useTranslations } from 'next-intl';
import Gallery from '@features/product/ui/Gallery';
import {
  Product as ShopifyProduct,
  ProductOption,
  ProductVariant,
} from '@shared/lib/shopify/types/storefront.types';
import { ProductInfo } from './ProductInfo';

export function ProductViewProvider({ product }: { product: ShopifyProduct }) {
  const t = useTranslations('ProductPage');
  if (!product) throw new Error('Product not found');
  const images = product.images.edges.map((edge) => edge.node).filter(Boolean);
  const colorOptions = product.options.find(
    (option) => option.name.toLowerCase() === t('colorLabel').toLowerCase(),
  )?.values;
  const sizeOptions = product.options.find(
    (option) => option.name.toLowerCase() === t('sizeLabel').toLowerCase(),
  )?.values;
  const [color, setColor] = useQueryState('color', {
    defaultValue:
      product.options
        .find(
          (option: ProductOption) =>
            option.name.toLowerCase() === t('colorLabel').toLowerCase(),
        )
        ?.values[0].toLowerCase() || '',
  });
  const [size, setSize] = useQueryState('size', {
    defaultValue:
      product.options
        .find(
          (option: ProductOption) =>
            option.name.toLowerCase() === t('sizeLabel').toLowerCase(),
        )
        ?.values[0].toLowerCase() || '',
  });
  const selectedVariant = product.variants.edges.find((edge) => {
    const variant = edge.node;
    const colorMatch = variant.selectedOptions.find(
      (option) =>
        option.name.toLowerCase() === t('colorLabel').toLowerCase() &&
        option.value.toLowerCase() === (color ?? ''),
    );
    const sizeMatch = variant.selectedOptions.find(
      (option) =>
        option.name.toLowerCase() === t('sizeLabel').toLowerCase() &&
        option.value.toLowerCase() === (size ?? ''),
    );
    return colorMatch && sizeMatch;
  })?.node;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_0.7fr_1.3fr] gap-6 lg:gap-12">
      <Gallery images={images} productId={product.id} isFavorite={false} />
      <ProductInfo
        product={product}
        colorOptions={colorOptions}
        sizeOptions={sizeOptions}
        selectedVariant={selectedVariant}
        setColor={setColor}
        setSize={setSize}
        color={color ?? ''}
        size={size ?? ''}
      />
    </div>
  );
}
