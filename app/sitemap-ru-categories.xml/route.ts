import {
  generateUrlsetXml,
  xmlResponse,
  formatDate,
  BASE_URL,
} from '@shared/lib/sitemap/xml';
import { getSitemapCategories } from '@shared/lib/sitemap/data';


export async function GET() {
  const categories = await getSitemapCategories();

  const entries = categories
    .filter((c) => c.ruHandle && c.ruHandle !== c.handle)
    .map((c) => {
      const ukUrl = `${BASE_URL}/uk/${c.gender}/${c.handle}`;
      const ruUrl = `${BASE_URL}/ru/${c.gender}/${c.ruHandle}`;
      return {
        url: ruUrl,
        lastModified: formatDate(c.updatedAt),
        changeFrequency: 'daily',
        priority: 0.9,
        alternates: {
          uk: ukUrl,
          ru: ruUrl,
          'x-default': ukUrl,
        },
      };
    });

  return xmlResponse(generateUrlsetXml(entries));
}
