import { toFilterSlug } from '@shared/lib/filterSlug';

const SIZE_OPTION_NAMES = ['розмір', 'размер', 'size'];

export type FilterVariant = {
  availableForSale: boolean;
  quantityAvailable?: number | null;
  selectedOptions: { name: string; value: string }[];
};

export type FilterProduct = {
  priceRange?: {
    minVariantPrice?: { amount: string };
    maxVariantPrice?: { amount: string };
  };
  totalInventory?: number | null;
  variants: {
    edges: { node: FilterVariant }[];
  };
  handle?: string;
};

export type OptionGroup = {
  name: string;
  values: Set<string>;
};

/**
 * Checks if a variant has sufficient quantity (> 0) for the selected size.
 * quantityAvailable === null means unlimited/no-tracking → treat as available.
 */
function variantHasStock(variant: FilterVariant): boolean {
  if (!variant.availableForSale) return false;
  if (
    variant.quantityAvailable !== null &&
    variant.quantityAvailable !== undefined &&
    variant.quantityAvailable <= 0
  ) {
    return false;
  }
  return true;
}

/**
 * Filters products client-side based on selected size slugs and option groups.
 *
 * - selectedSizeSlugs: set of URL slugs for rozmir filter (e.g. Set{"46", "48"})
 * - optionGroups: map of variantOption filters (e.g. color, material)
 */
export function filterProducts<T extends FilterProduct>(
  products: T[],
  selectedSizeSlugs: Set<string>,
  optionGroups: Map<string, OptionGroup>,
): T[] {
  return products.filter((product) => {
    const hasPrice =
      (product.priceRange?.minVariantPrice?.amount &&
        Number(product.priceRange.minVariantPrice.amount) > 0) ||
      (product.priceRange?.maxVariantPrice?.amount &&
        Number(product.priceRange.maxVariantPrice.amount) > 0);

    if (!hasPrice) return false;

    if (selectedSizeSlugs.size === 0 && optionGroups.size === 0) {
      return (
        product.totalInventory === null ||
        product.totalInventory === undefined ||
        product.totalInventory > 0
      );
    }

    return product.variants.edges.some(({ node: variant }) => {
      if (!variantHasStock(variant)) return false;

      if (selectedSizeSlugs.size > 0) {
        const sizeOpt = variant.selectedOptions.find((o) =>
          SIZE_OPTION_NAMES.includes(o.name.toLowerCase()),
        );
        if (!sizeOpt || !selectedSizeSlugs.has(toFilterSlug(sizeOpt.value)))
          return false;
      }

      if (optionGroups.size > 0) {
        const matchesOptions = [...optionGroups.values()].every(
          ({ name, values }) =>
            variant.selectedOptions.some(
              (o) => o.name === name && values.has(o.value),
            ),
        );
        if (!matchesOptions) return false;
      }

      return true;
    });
  });
}
