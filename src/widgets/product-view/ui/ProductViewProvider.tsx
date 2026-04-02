'use client';
import { useQueryState } from 'nuqs';
import { useEffect } from 'react';
import { Product as ShopifyProduct } from '@shared/lib/shopify/types/storefront.types';
import { ProductMEtaobjectType } from '@entities/metaobject/api/get-metaobject';
import { VariantInventory } from '@entities/product/api/getInventoryLevels';
import { ScrollToTop } from '@shared/ui/ScrollToTop';
import { ProductInfo } from './ProductInfo';

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

  const [size, _setSize] = useQueryState('size', { shallow: true, scroll: false });

  // Remember last selected size in localStorage
  const setSize = (value: string) => {
    _setSize(value);
    try { localStorage.setItem('lastSize', value); } catch {}
  };

  // Auto-select last size if no size in URL and a matching variant exists
  useEffect(() => {
    if (size) return;
    try {
      const lastSize = localStorage.getItem('lastSize');
      if (!lastSize) return;
      const hasMatch = product.variants.edges.some((edge) =>
        edge.node.selectedOptions.some(
          (opt) =>
            SIZE_NAMES.includes(opt.name.toLowerCase()) &&
            opt.value.toLowerCase() === lastSize &&
            edge.node.availableForSale,
        ),
      );
      if (hasMatch) _setSize(lastSize);
    } catch {}
  }, []);

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
