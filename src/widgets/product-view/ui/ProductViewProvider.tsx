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

  const sortedSizeOptions = sizeOptions?.sort((a, b) => {
    const sizeOrder = ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'];
    const aIsNumeric = !isNaN(Number(a));
    const bIsNumeric = !isNaN(Number(b));

    if (aIsNumeric && bIsNumeric) {
      return Number(a) - Number(b);
    }

    if (!aIsNumeric && !bIsNumeric) {
      return (
        sizeOrder.indexOf(a.toLowerCase()) - sizeOrder.indexOf(b.toLowerCase())
      );
    }

    return aIsNumeric ? -1 : 1;
  });

  const firstAvailableSize = sortedSizeOptions?.find((s) => {
    const variant = product.variants.edges.find((edge) =>
      edge.node.selectedOptions.some(
        (option) =>
          option.name.toLowerCase() === 'розмір' &&
          option.value.toLowerCase() === s.toLowerCase(),
      ),
    )?.node;
    return variant?.availableForSale;
  });

  const [size, setSize] = useQueryState('size', {
    defaultValue: firstAvailableSize?.toLowerCase() || '',
  });
  const selectedVariant = product.variants.edges.find((edge) => {
    const variant = edge.node;

    const sizeMatch = variant.selectedOptions.find(
      (option) =>
        option.name.toLowerCase() === 'Розмір'.toLowerCase() &&
        option.value.toLowerCase() === (size ?? ''),
    );
    return sizeMatch;
  })?.node;
  if (!selectedVariant) {
    const firstAvailableVariant = product.variants.edges.find(
      (edge) => edge.node.availableForSale,
    )?.node;
    if (firstAvailableVariant) {
      const sizeOption = firstAvailableVariant.selectedOptions.find(
        (option) => option.name.toLowerCase() === 'розмір',
      );
      if (sizeOption) {
        setSize(sizeOption.value.toLowerCase());
      }
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_0.7fr_1.3fr] gap-6 lg:gap-12">
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
  );
}
