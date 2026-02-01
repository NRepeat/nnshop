/**
 * Converts vendor name to a URL-friendly handle
 * Example: "Mary&Co" -> "mary-amp-co"
 * Example: "Nike Inc." -> "nike-inc"
 */
export function vendorToHandle(vendor: string): string {
  return vendor
    .toLowerCase()
    // Remove zero-width characters and other invisible Unicode characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/&/g, '-amp-') // Replace & with -amp-
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w\-]/g, '') // Remove special characters except hyphens
    .replace(/\-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^\-+|\-+$/g, ''); // Remove leading/trailing hyphens
}
