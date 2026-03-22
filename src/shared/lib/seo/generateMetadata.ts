import { Metadata } from 'next';

/** Removes zero-width and invisible Unicode characters that Shopify/Sanity data may contain */
export function stripInvisible(str: string): string {
  return str.replace(/[\u200b\u200c\u200d\ufeff\u00ad\u034f\u115f\u1160\u17b4\u17b5\u180b-\u180e\u2060-\u206f\ufe00-\ufe0f]/g, '').trim();
}

/** Truncates title to 70 characters max (Cyrillic chars are pixel-wider than Latin) */
export function formatTitle(title: string): string {
  const clean = stripInvisible(title);
  if (clean.length > 70) {
    return clean.substring(0, 67) + '...';
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
  path: string
): Metadata {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${BASE_URL}/${locale}${normalizedPath}`;

  return {
    title: { absolute: seo.title || 'Mio Mio' },
    description: seo.description,
    robots: seo.noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'uk': `${BASE_URL}/uk${normalizedPath}`,
        'ru': `${BASE_URL}/ru${normalizedPath}`,
        'x-default': `${BASE_URL}/uk${normalizedPath}`,
      },
    },
    openGraph: {
      title: seo.title || 'Mio Mio',
      description: seo.description,
      url: canonicalUrl,
      siteName: 'Mio Mio',
      images: [{ url: seo.image || DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
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
  slug: string
): Metadata {
  const isUk = locale === 'uk';

  const vendor = stripInvisible(product.vendor || '');
  const productTitle = stripInvisible(product.title || '');

  let baseTitle = '';
  if (productTitle.toLowerCase().includes(vendor.toLowerCase())) {
    baseTitle = productTitle;
  } else {
    baseTitle = `${vendor} ${productTitle}`;
  }

  const rawTitle = isUk
    ? `Купити ${baseTitle} в інтернет-магазині | MioMio` 
    : `Купить ${baseTitle} в интернет-магазине | MioMio`;
  const title = formatTitle(rawTitle);

  const description = isUk
    ? `Купити ${baseTitle} в інтернет-магазині MioMio. Фото, характеристики, доступні розміри та актуальна наявність. Доставка по Україні ✔️`
    : `Купить ${baseTitle} в интернет-магазине MioMio. Фото, характеристики, доступные размеры и актуальное наличие. Доставка по Украине ✔️`;

  return generatePageMetadata(
    { title, description, image: product.featuredImage?.url },
    locale,
    `/product/${slug}`
  );
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
  const genderSuffix = gender ? (genderPhrase[gender as 'woman' | 'man'] ?? '') : '';
  const rawTitle = isUk
    ? `Купити ${cleanTitle}${genderSuffix} в інтернет-магазині | MioMio`
    : `Купить ${cleanTitle}${genderSuffix} в интернет-магазине | MioMio`;
  const title = formatTitle(rawTitle);

  const templateDescription = isUk
    ? `Купити ${cleanTitle}${genderSuffix} в інтернет-магазині MioMio. Добірка найкращих моделей, перевіряйте наявність та обирайте свій розмір. Доставка по Україні ✔️`
    : `Купить ${cleanTitle}${genderSuffix} в интернет-магазине MioMio. Подборка лучших моделей, проверяйте наличие и выбирайте свой размер. Доставка по Украине ✔️`;

  const description = templateDescription || collection.seo?.description?.trim();

  // Build locale-specific alternate URLs using the correct handle per locale
  const altHandle = alternateHandle || slug;
  const ukPath = `${prefix}/${isUk ? slug : altHandle}`;
  const ruPath = `${prefix}/${isUk ? altHandle : slug}`;

  const normalizedPath = `${prefix}/${slug}`.startsWith('/') ? `${prefix}/${slug}` : `/${prefix}/${slug}`;
  const canonicalUrl = `${BASE_URL}/${locale}${normalizedPath}`;

  return {
    title: { absolute: title },
    description,
    robots: 'index, follow',
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'uk': `${BASE_URL}/uk${ukPath}`,
        'ru': `${BASE_URL}/ru${ruPath}`,
        'x-default': `${BASE_URL}/uk${ukPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Mio Mio',
      images: [{ url: collection.image?.url || `${BASE_URL}/og-image.jpg`, width: 1200, height: 630 }],
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
  slug: string
): Metadata {
  const isUk = locale === 'uk';
  const cleanTitle = stripInvisible(brand.title);
  const rawTitle = isUk
    ? `${cleanTitle} — купити в інтернет-магазині | MioMio`
    : `${cleanTitle} — купить в интернет-магазине | MioMio`;
  const title = formatTitle(rawTitle);

  const description = isUk
    ? `${cleanTitle} в MioMio: моделі бренду, фото, доступні розміри та актуальна наявність. Зручне замовлення онлайн та доставка по Україні ✔️`
    : `${cleanTitle} в MioMio: модели бренда, фото, доступные размеры и актуальное наличие. Удобный заказ онлайн и доставка по Украине ✔️`;

  return generatePageMetadata(
    { title, description, image: brand.image?.url },
    locale,
    `/brand/${slug}`
  );
}
