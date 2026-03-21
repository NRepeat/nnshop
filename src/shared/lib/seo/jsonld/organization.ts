import {
  SITE_URL,
  BRAND_NAME,
  INSTAGRAM_URL,
  FACEBOOK_URL,
  TELEGRAM_URL,
  TELEGRAM_CHANNEL_URL,
} from '@shared/config/brand';

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [INSTAGRAM_URL, FACEBOOK_URL, TELEGRAM_URL, TELEGRAM_CHANNEL_URL],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+380972179292',
      contactType: 'customer service',
      email: 'info@miomio.com.ua',
      availableLanguage: ['Ukrainian', 'Russian'],
      areaServed: 'UA',
    },
  };
}
