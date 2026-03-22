import { decodeHtmlEntities } from '@shared/lib/utils/decodeHtmlEntities';

/**
 * Generates localized and descriptive alt text for product images.
 * Format: "{Product Title} {Variant Info}"
 *
 * @param product Product object with title
 * @param variant Optional variant object with title
 * @returns Formatted and decoded alt text string
 */
export function getProductAlt(
  product: { title: string },
  variant?: { title?: string }
): string {
  const parts: string[] = [];

  if (product.title) {
    parts.push(product.title.trim());
  }

  if (variant?.title && variant.title.toLowerCase() !== 'default title') {
    parts.push(variant.title.trim());
  }

  return decodeHtmlEntities(parts.join(' ')).trim();
}
