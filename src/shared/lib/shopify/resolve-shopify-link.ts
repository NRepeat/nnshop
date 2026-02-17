type LocalizedHandles = {
  uk?: string | null;
  ru?: string | null;
} | null;

type LocalizedTitles = {
  uk?: string | null;
  ru?: string | null;
} | null;

export type CollectionData = {
  id?: number | null;
  handle?: string | null;
  slug?: string | null;
  title?: string | null;
  handles?: LocalizedHandles;
  titles?: LocalizedTitles;
  pageHandle?: string | null;
  image?: {
    url?: string | null;
  } | null;
};

/**
 * Resolves the localized handle for a collection based on locale.
 * Uses Sanity data directly instead of making API calls to Shopify.
 */
const cleanString = (str: string | null | undefined): string | null => {
  if (!str) return null;
  // This regex removes Zero Width Space, Zero Width Non-Joiner, Zero Width Joiner, and BOM
  return str.replace(/[\u200B-\u200D\uFEFF]/g, '');
};

export const resolveCollectionLink = (
  collectionData: CollectionData | null | undefined,
  locale: string,
  gender?: string,
): {
  handle: string | null;
  title: string | null;
  image?: { url?: string | null } | null;
} => {
  if (!collectionData) {
    return { handle: null, title: null };
  }

  // Get localized handle - fallback to default handle/slug
  const localeKey = locale as 'uk' | 'ru';
  const handle =
    collectionData.handles?.[localeKey] ||
    collectionData.handle ||
    collectionData.slug ||
    null;

  // Get localized title - fallback to default title
  const title =
    collectionData.titles?.[localeKey] || collectionData.title || null;

  const cleanedHandle = cleanString(handle);
  const cleanedTitle = cleanString(title);

  const prefix = gender ? `/${gender}` : '';

  return {
    handle: cleanedHandle ? `${prefix}/${cleanedHandle}` : null,
    title: cleanedTitle,
    image: collectionData.image,
  };
};
