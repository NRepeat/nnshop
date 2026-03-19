import { SITE_URL, BRAND_NAME, INSTAGRAM_URL, FACEBOOK_URL } from '@shared/config/brand';

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      INSTAGRAM_URL,
      FACEBOOK_URL,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Ukrainian', 'Russian'],
    },
  };
}
