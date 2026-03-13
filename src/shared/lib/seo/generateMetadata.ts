import { Metadata } from 'next';

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
  },
  locale: string,
  slug: string
): Metadata {
  const isUk = locale === 'uk';
  
  // Create a clean title without repeating words
  // Example: if productType is "Босоніжки" and title is "Босоніжки Albano ...", we don't want to repeat "Босоніжки"
  const type = product.productType || '';
  const vendor = product.vendor || '';
  const productTitle = product.title || '';
  
  let baseTitle = '';
  if (productTitle.toLowerCase().includes(vendor.toLowerCase())) {
    baseTitle = productTitle;
  } else {
    baseTitle = `${vendor} ${productTitle}`;
  }

  // Ensure productType is included if it's not already in the title
  if (type && !baseTitle.toLowerCase().includes(type.toLowerCase())) {
    baseTitle = `${type} ${baseTitle}`;
  }

  const title = `${baseTitle} | MioMio`;
  const description = isUk
    ? 'Фото, характеристики та доступні розміри в наявності. Зручне оформлення замовлення онлайн і доставка по Україні ✔️'
    : 'Фото, характеристики и доступные размеры в наличии. Удобное оформление заказа онлайн и доставка по Украине ✔️';

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
): Metadata {
  const isUk = locale === 'uk';
  const prefix = gender ? `/${gender}` : '';
  const genderPhrase = isUk
    ? { woman: ' для жінок', man: ' для чоловіків' }
    : { woman: ' для женщин', man: ' для мужчин' };
  const genderSuffix = gender ? (genderPhrase[gender as 'woman' | 'man'] ?? '') : '';
  const title = isUk
    ? `Купити ${collection.title}${genderSuffix} | MioMio`
    : `Купить ${collection.title}${genderSuffix} | MioMio`;
  const templateDescription = isUk
    ? `Добірка ${collection.title}${genderSuffix} в MioMio. Перевіряйте наявність, обирайте розмір і оформлюйте замовлення онлайн.`
    : `Подборка ${collection.title}${genderSuffix} в MioMio. Проверяйте наличие, выбирайте размер и оформляйте заказ онлайн.`;
  // Template is primary; Shopify seo.description (if set in admin) as fallback
  const description = templateDescription || collection.seo?.description?.trim();

  return generatePageMetadata(
    { title, description, image: collection.image?.url },
    locale,
    `${prefix}/${slug}`
  );
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
  const title = isUk
    ? `${brand.title} — купити онлайн | MioMio`
    : `${brand.title} — купить онлайн | MioMio`;
  const description = isUk
    ? 'Моделі бренду в MioMio: фото, доступні розміри та актуальна наявність. Доставка по Україні ✔️'
    : 'Модели бренда в MioMio: фото, доступные размеры и актуальное наличие. Доставка по Украине ✔️';
  return generatePageMetadata(
    { title, description, image: brand.image?.url },
    locale,
    `/brand/${slug}`
  );
}
