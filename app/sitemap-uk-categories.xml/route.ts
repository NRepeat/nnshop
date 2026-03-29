import {
  generateUrlsetXml,
  xmlResponse,
  formatDate,
  BASE_URL,
} from '@shared/lib/sitemap/xml';
import { getSitemapCategories } from '@shared/lib/sitemap/data';


export async function GET() {
  const categories = await getSitemapCategories();

  const entries = categories.map((c) => {
    const ukUrl = `${BASE_URL}/uk/${c.gender}/${c.handle}`;
    const ruUrl = `${BASE_URL}/ru/${c.gender}/${c.ruHandle}`;
    // Only include RU alternate if the RU handle differs from UK (meaning a real translation exists)
    const hasRuAlternate = c.ruHandle && c.ruHandle !== c.handle;
    return {
      url: ukUrl,
      lastModified: formatDate(c.updatedAt),
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        uk: ukUrl,
        ...(hasRuAlternate ? { ru: ruUrl } : {}),
        'x-default': ukUrl,
      },
    };
  });

  return xmlResponse(generateUrlsetXml(entries));
}
