import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.miomio.com.ua';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Service pages — no crawl budget
          '/api/',
          '/admin/',
          '/studio/',
          '/uk/auth/',
          '/ru/auth/',
          '/uk/checkout/',
          '/ru/checkout/',
          '/uk/cart/',
          '/ru/cart/',
          '/uk/account/',
          '/ru/account/',
          '/uk/favorites/',
          '/ru/favorites/',
          '*/search*',
          // URL parameters that generate duplicates
          '/*?q=',
          '/*?sort=*',
          '/*?limit=*',
          '/*?page=*',
          '/*?utm_*',
          '/*?gclid=*',
          '/*?fbclid=*',
          '/*?ref=*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
