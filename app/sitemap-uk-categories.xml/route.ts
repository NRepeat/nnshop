import {
  generateUrlsetXml,
  xmlResponse,
  formatDate,
  BASE_URL,
} from '@shared/lib/sitemap/xml';
import { getSitemapCategories } from '@shared/lib/sitemap/data';


export async function GET() {
  const categories = await getSitemapCategories();

  const entries = categories.map((c) => ({
    url: `${BASE_URL}/uk/${c.gender}/${c.handle}`,
    lastModified: formatDate(c.updatedAt),
    changeFrequency: 'daily',
    priority: 0.9,
    alternates: {
      uk: `${BASE_URL}/uk/${c.gender}/${c.handle}`,
      ru: `${BASE_URL}/ru/${c.gender}/${c.handle}`,
      'x-default': `${BASE_URL}/uk/${c.gender}/${c.handle}`,
    },
  }));

  return xmlResponse(generateUrlsetXml(entries));
}
