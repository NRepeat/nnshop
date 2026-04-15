import { Metadata } from 'next';

/** Removes zero-width and invisible Unicode characters that Shopify/Sanity data may contain */
export function stripInvisible(str: string): string {
  return str
    .replace(
      /[\u200b\u200c\u200d\ufeff\u00ad\u034f\u115f\u1160\u17b4\u17b5\u180b-\u180e\u2060-\u206f\ufe00-\ufe0f]/g,
      ' ',
    )
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const TITLE_CHAR_LIMIT = 52;
const LONG_SUFFIX_UK = ' в інтернет-магазині | MioMio';
const LONG_SUFFIX_RU = ' в интернет-магазине | MioMio';
const SHORT_SUFFIX = ' | MioMio';

/**
 * Builds a SEO title that fits within the character limit.
 * Strategy: name (vendor + title + SKU) is always preserved for uniqueness.
 * We sacrifice the suffix: full → short → none.
 */
export function buildTitle(
  prefix: string,
  name: string,
  locale: string,
): string {
  const isUk = locale === 'uk';
  const longSuffix = isUk ? LONG_SUFFIX_UK : LONG_SUFFIX_RU;

  const full = `${prefix}${name}${longSuffix}`;
  if (stripInvisible(full).length <= TITLE_CHAR_LIMIT) return stripInvisible(full);

  const short = `${prefix}${name}${SHORT_SUFFIX}`;
  if (stripInvisible(short).length <= TITLE_CHAR_LIMIT) return stripInvisible(short);

  // Name is too long even with short suffix — drop suffix entirely
  return stripInvisible(`${prefix}${name}`);
}

const DESC_CHAR_LIMIT = 155;

/** Truncates description to fit within the character limit */
export function formatDescription(desc: string): string {
  const clean = stripInvisible(desc);
  if (clean.length <= DESC_CHAR_LIMIT) return clean;
  return clean.substring(0, DESC_CHAR_LIMIT - 1) + '…';
}

/** @deprecated Use buildTitle instead */
export function formatTitle(title: string): string {
  const clean = stripInvisible(title);
  if (clean.length > TITLE_CHAR_LIMIT) {
    return clean.substring(0, TITLE_CHAR_LIMIT - 3) + '...';
  }
  return clean;
}

interface SEOData {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;

export function generatePageMetadata(
  seo: SEOData,
  locale: string,
  path: string,
): Metadata {
  const rawPath = path.startsWith('/') ? path : `/${path}`;
  // Strip trailing slash to avoid canonical pointing to a redirect
  const normalizedPath = rawPath === '/' ? '' : rawPath;
  const canonicalUrl = `${BASE_URL}/${locale}${normalizedPath}`;

  return {
    title: { absolute: seo.title || 'Mio Mio' },
    description: seo.description,
    robots: seo.noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: canonicalUrl,
      ...(seo.noIndex
        ? {}
        : {
            languages: {
              uk: `${BASE_URL}/uk${normalizedPath}`,
              ru: `${BASE_URL}/ru${normalizedPath}`,
              'x-default': `${BASE_URL}/uk${normalizedPath}`,
            },
          }),
    },
    openGraph: {
      title: seo.title || 'Mio Mio',
      description: seo.description,
      url: canonicalUrl,
      siteName: 'Mio Mio',
      images: [
        { url: seo.image || DEFAULT_OG_IMAGE, width: 1200, height: 630 },
      ],
      locale: locale === 'uk' ? 'uk_UA' : 'ru_UA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title || 'Mio Mio',
      description: seo.description,
      images: [seo.image || DEFAULT_OG_IMAGE],
    },
  };
}

export function generateProductMetadata(
  product: {
    title: string;
    vendor?: string | null;
    productType?: string | null;
    featuredImage?: { url: string } | null;
    variants?: { edges: { node: { sku?: string | null } }[] } | null;
  },
  locale: string,
  slug: string,
  alternateHandle?: string | null,
): Metadata {
  const isUk = locale === 'uk';

  const vendor = stripInvisible(product.vendor || '');
  const productTitle = stripInvisible(product.title || '');
  const sku = product.variants?.edges[0]?.node.sku || '';

  let baseTitle = '';
  if (productTitle.toLowerCase().includes(vendor.toLowerCase())) {
    baseTitle = sku ? `${productTitle} ${sku}` : productTitle;
  } else {
    baseTitle = `${vendor} ${productTitle}${sku ? ` ${sku}` : ''}`;
  }

  const titlePrefix = isUk ? 'Купити ' : 'Купить ';
  const title = buildTitle(titlePrefix, baseTitle, locale);

  const description = formatDescription(isUk
    ? `Купити ${baseTitle} в інтернет-магазині MioMio. Фото, характеристики, доступні розміри та актуальна наявність. Доставка по Україні ✔️`
    : `Купить ${baseTitle} в интернет-магазине MioMio. Фото, характеристики, доступные размеры и актуальное наличие. Доставка по Украине ✔️`);

  const ukSlug = isUk ? slug : (alternateHandle || slug);
  const ruSlug = isUk ? (alternateHandle || slug) : slug;

  const metadata = generatePageMetadata(
    { title, description, image: product.featuredImage?.url },
    locale,
    `/product/${slug}`,
  );

  // Product pages must use og:type "product" (not "website")
  if (metadata.openGraph) {
    (metadata.openGraph as any).type = 'product';
  }

  metadata.alternates = {
    ...metadata.alternates,
    languages: {
      uk: `${BASE_URL}/uk/product/${ukSlug}`,
      ru: `${BASE_URL}/ru/product/${ruSlug}`,
      'x-default': `${BASE_URL}/uk/product/${ukSlug}`,
    },
  };

  return metadata;
}

export function generateCollectionMetadata(
  collection: {
    title: string;
    description?: string | null;
    seo?: { description?: string | null } | null;
    image?: { url: string } | null;
  },
  locale: string,
  slug: string,
  gender?: string,
  alternateHandle?: string,
): Metadata {
  const isUk = locale === 'uk';
  const cleanTitle = stripInvisible(collection.title);
  const prefix = gender ? `/${gender}` : '';
  const genderPhrase = isUk
    ? { woman: ' для жінок', man: ' для чоловіків' }
    : { woman: ' для женщин', man: ' для мужчин' };
  const genderSuffix = gender
    ? (genderPhrase[gender as 'woman' | 'man'] ?? '')
    : '';
  const titlePrefix = isUk ? 'Купити ' : 'Купить ';
  const title = buildTitle(titlePrefix, `${cleanTitle}${genderSuffix}`, locale);

  const templateDescription = formatDescription(isUk
    ? `Купити ${cleanTitle}${genderSuffix} в інтернет-магазині MioMio. Добірка найкращих моделей, перевіряйте наявність та обирайте свій розмір. Доставка по Україні ✔️`
    : `Купить ${cleanTitle}${genderSuffix} в интернет-магазине MioMio. Подборка лучших моделей, проверяйте наличие и выбирайте свой размер. Доставка по Украине ✔️`);

  const description =
    templateDescription || collection.seo?.description?.trim();

  // Build locale-specific alternate URLs using the correct handle per locale
  const hasAlternate = !!alternateHandle && alternateHandle !== slug;
  const altHandle = alternateHandle || slug;
  const ukPath = `${prefix}/${isUk ? slug : altHandle}`;
  const ruPath = `${prefix}/${isUk ? altHandle : slug}`;

  const normalizedPath = `${prefix}/${slug}`.startsWith('/')
    ? `${prefix}/${slug}`
    : `/${prefix}/${slug}`;
  const canonicalUrl = `${BASE_URL}/${locale}${normalizedPath}`;

  // Only include alternate language hreflang if a real translated handle exists
  const languages: Record<string, string> = {
    uk: `${BASE_URL}/uk${ukPath}`,
    'x-default': `${BASE_URL}/uk${ukPath}`,
  };
  if (hasAlternate) {
    languages.ru = `${BASE_URL}/ru${ruPath}`;
  }

  return {
    title: { absolute: title },
    description,
    robots: 'index, follow',
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Mio Mio',
      images: [
        {
          url: collection.image?.url || `${BASE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
        },
      ],
      locale: locale === 'uk' ? 'uk_UA' : 'ru_UA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [collection.image?.url || `${BASE_URL}/og-image.jpg`],
    },
  };
}

export function generateBrandMetadata(
  brand: {
    title: string;
    image?: { url: string } | null;
  },
  locale: string,
  slug: string,
): Metadata {
  const isUk = locale === 'uk';
  const cleanTitle = stripInvisible(brand.title);
  const brandSuffix = isUk ? ' — купити' : ' — купить';
  const title = buildTitle('', `${cleanTitle}${brandSuffix}`, locale);

  const description = formatDescription(isUk
    ? `${cleanTitle} в MioMio: моделі бренду, фото, доступні розміри та актуальна наявність. Зручне замовлення онлайн та доставка по Україні ✔️`
    : `${cleanTitle} в MioMio: модели бренда, фото, доступные размеры и актуальное наличие. Удобный заказ онлайн и доставка по Украине ✔️`);

  return generatePageMetadata(
    { title, description, image: brand.image?.url },
    locale,
    `/brand/${slug}`,
  );
}
