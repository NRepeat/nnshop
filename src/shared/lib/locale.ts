import { sanityFetch } from '@/shared/sanity/lib/client';
import { LOCALES_QUERY, DEFAULT_LOCALE_QUERY } from '@/shared/sanity/lib/query';

export interface SanityLocale {
  _id: string;
  tag: string | null;
  name: string | null;
  default: boolean | null;
  fallback?: { tag: string | null } | null;
}

/**
 * Get all available locales from Sanity
 */
export async function getAvailableLocales(): Promise<SanityLocale[]> {
  try {
    const locales = await sanityFetch({
      query: LOCALES_QUERY,
      revalidate: 3600,
    });
    return locales || [];
  } catch (error) {
    console.error('Failed to fetch locales from Sanity:', error);
    return [];
  }
}

/**
 * Get the default locale from Sanity
 */
export async function getDefaultLocale(): Promise<string> {
  try {
    const defaultLocale = await sanityFetch({
      query: DEFAULT_LOCALE_QUERY,
      revalidate: 3600,
    });
    return defaultLocale || 'uk';
  } catch (error) {
    console.error('Failed to fetch default locale from Sanity:', error);
    return 'uk';
  }
}

/**
 * Check if a locale is supported
 */
export async function isLocaleSupported(locale: string): Promise<boolean> {
  const availableLocales = await getAvailableLocales();
  return availableLocales.some((l) => l.tag === locale && l.tag !== null);
}

/**
 * Get fallback locale for a given locale
 */
export async function getFallbackLocale(locale: string): Promise<string> {
  const availableLocales = await getAvailableLocales();
  const currentLocale = availableLocales.find(
    (l) => l.tag === locale && l.tag !== null,
  );

  if (currentLocale?.fallback?.tag) {
    return currentLocale.fallback.tag;
  }

  // Fallback to default locale
  return await getDefaultLocale();
}

/**
 * Get locale display name
 */
export async function getLocaleDisplayName(locale: string): Promise<string> {
  const availableLocales = await getAvailableLocales();
  const localeInfo = availableLocales.find(
    (l) => l.tag === locale && l.tag !== null,
  );
  return localeInfo?.name || locale;
}

/**
 * Normalize locale for Sanity queries
 * Ensures the locale exists in Sanity, falls back to default if not
 */
export async function normalizeLocaleForSanity(
  locale: string,
): Promise<string> {
  const isSupported = await isLocaleSupported(locale);

  if (isSupported) {
    return locale;
  }

  // If not supported, return default locale
  return await getDefaultLocale();
}

/**
 * Get locale-specific URL path
 */
export function getLocalizedPath(
  path: string,
  locale: string,
  defaultLocale: string = 'uk',
): string {
  // Don't add locale prefix for default locale
  if (locale === defaultLocale) {
    return path;
  }

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `/${locale}${cleanPath}`;
}

/**
 * Extract locale from pathname
 */
export function extractLocaleFromPath(
  pathname: string,
  supportedLocales: string[] = ['en', 'uk'],
): {
  locale: string;
  pathWithoutLocale: string;
} {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length > 0 && supportedLocales.includes(segments[0])) {
    return {
      locale: segments[0],
      pathWithoutLocale: `/${segments.slice(1).join('/')}`,
    };
  }

  return {
    locale: 'uk', // default locale
    pathWithoutLocale: pathname,
  };
}

/**
 * Validate locale format (IANA language tag)
 */
export function isValidLocaleFormat(locale: string): boolean {
  const ianaPattern =
    /^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-(?:[A-Z]{2}|\d{3}))?(?:-[a-zA-Z0-9]{5,8}|-[0-9][a-zA-Z0-9]{3})*$/;
  return ianaPattern.test(locale);
}

/**
 * Check if content is default fallback (English) for non-English locale
 */
export function isDefaultContentFallback(
  contentLanguage: string | null | undefined,
  requestedLocale: string,
): boolean {
  // If requested locale is English, it's never a fallback
  if (requestedLocale === 'en') {
    return false;
  }

  // If content has no language or is English, but user requested non-English
  return !contentLanguage || contentLanguage === 'en';
}

/**
 * Get content language display info
 */
export function getContentLanguageInfo(
  contentLanguage: string | null | undefined,
  requestedLocale: string,
) {
  const isFallback = isDefaultContentFallback(contentLanguage, requestedLocale);

  return {
    isFallback,
    displayLanguage: contentLanguage || 'en',
    shouldShowIndicator: isFallback,
    indicatorText: 'EN', // English content indicator
  };
}

/**
 * Get alternate language links for SEO
 */
export async function getAlternateLanguageLinks(currentPath: string): Promise<
  Array<{
    hreflang: string;
    href: string;
  }>
> {
  const availableLocales = await getAvailableLocales();
  const defaultLocale = await getDefaultLocale();

  return availableLocales.map((locale) => ({
    hreflang: locale.tag || 'en',
    href: getLocalizedPath(currentPath, locale.tag || 'en', defaultLocale),
  }));
}
