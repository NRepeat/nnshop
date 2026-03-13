import {
  generateSitemapIndexXml,
  xmlResponse,
  formatDate,
  BASE_URL,
} from '@shared/lib/sitemap/xml';


export async function GET() {
  const today = formatDate(new Date());
  const locales = ['uk', 'ru'];
  const types = ['categories', 'products', 'brands', 'pages', 'posts'];

  const sitemaps = locales.flatMap((locale) =>
    types.map((type) => ({
      url: `${BASE_URL}/sitemap-${locale}-${type}.xml`,
      lastModified: today,
    })),
  );

  return xmlResponse(generateSitemapIndexXml(sitemaps));
}
