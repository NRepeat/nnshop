import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/studio/', '/auth/', '/checkout/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
