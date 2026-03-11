'use client';
import { useQueryState } from 'nuqs';
import { Product as ShopifyProduct } from '@shared/lib/shopify/types/storefront.types';
import { ProductMEtaobjectType } from '@entities/metaobject/api/get-metaobject';
import { VariantInventory } from '@entities/product/api/getInventoryLevels';
import { ScrollToTop } from '@shared/ui/ScrollToTop';
import dynamic from 'next/dynamic';

const ProductInfo = dynamic(() => import('./ProductInfo').then(mod => mod.ProductInfo));

export function ProductViewProvider({
  product,
  boundProducts,
  attributes,
  inventoryLevels,
  children,
}: {
  product: ShopifyProduct;
  boundProducts: ShopifyProduct[];
  attributes: ProductMEtaobjectType[];
  inventoryLevels?: VariantInventory[];
  children?: React.ReactNode;
}) {
  if (!product) throw new Error('Product not found');
  const COLOR_NAMES = ['колір', 'цвет', 'color'];
  const SIZE_NAMES = ['розмір', 'размер', 'size'];
  const isColorOption = (name: string) => COLOR_NAMES.includes(name.toLowerCase());
  const isSizeOption = (name: string) => SIZE_NAMES.includes(name.toLowerCase());

  const colorOptions = product.options.find((o) => isColorOption(o.name))?.values;
  const boundProductColorOptions = boundProducts.filter((p) =>
    p.options.some((o) => isColorOption(o.name)),
  );
  const sizeOptions = product.options.find((o) => isSizeOption(o.name))?.values;

  const [size, setSize] = useQueryState('size', { shallow: true, scroll: false });
  let selectedVariant = undefined;

  if (size) {
    selectedVariant = product.variants.edges.find((edge) => {
      const variant = edge.node;
      const sizeMatch = variant.selectedOptions.find(
        (option) =>
          SIZE_NAMES.includes(option.name.toLowerCase()) &&
          option.value.toLowerCase() === (size ?? ''),
      );
      return sizeMatch;
    })?.node;
  }
  return (
    <>
      <ScrollToTop />
      {children}
      <ProductInfo
        product={product}
        colorOptions={colorOptions}
        sizeOptions={sizeOptions}
        selectedVariant={selectedVariant}
        setSize={setSize}
        boundProduct={boundProductColorOptions}
        size={size ?? ''}
        attributes={attributes}
        inventoryLevels={inventoryLevels ?? []}
      />
    </>
  );
}
