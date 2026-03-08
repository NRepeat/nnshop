import { Metadata } from 'next';

interface SEOData {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua';

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
      images: seo.image ? [{ url: seo.image, width: 1200, height: 630 }] : [],
      locale: locale === 'uk' ? 'uk_UA' : 'ru_UA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title || 'Mio Mio',
      description: seo.description,
      images: seo.image ? [seo.image] : [],
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
  const titleParts = [product.productType, product.vendor, product.title].filter(Boolean);
  const title = `${titleParts.join(' ')} | MioMio`;
  const description = isUk
    ? `Купити ${product.title} в MioMio — фото, характеристики та доступні розміри в наявності. Зручне оформлення замовлення онлайн і доставка по Україні ✔️`
    : `Купить ${product.title} в MioMio — фото, характеристики и доступные размеры в наличии. Удобное оформление заказа онлайн и доставка по Украине ✔️`;

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
    image?: { url: string } | null;
  },
  locale: string,
  slug: string,
  gender?: string,
): Metadata {
  const isUk = locale === 'uk';
  const prefix = gender ? `/${gender}` : '';
  const title = isUk
    ? `Купити ${collection.title} | MioMio`
    : `Купить ${collection.title} | MioMio`;
  const genderWord = isUk
    ? { woman: 'жіноче ', man: 'чоловіче ' }
    : { woman: 'женское ', man: 'мужское ' };
  const genderPrefix = gender ? (genderWord[gender as 'woman' | 'man'] ?? '') : '';
  const fallbackDescription = isUk
    ? `Обирайте ${genderPrefix}${collection.title} в MioMio: актуальні моделі, популярні бренди та зручна доставка по Україні.`
    : `Выбирайте ${genderPrefix}${collection.title} в MioMio: актуальные модели, популярные бренды и доставка по Украине.`;
  const description = collection.description?.trim() || fallbackDescription;

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
