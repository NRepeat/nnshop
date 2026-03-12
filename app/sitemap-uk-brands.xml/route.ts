import {
  generateUrlsetXml,
  xmlResponse,
  formatDate,
  BASE_URL,
} from '@shared/lib/sitemap/xml';
import { getSitemapBrands } from '@shared/lib/sitemap/data';


export async function GET() {
  const brands = await getSitemapBrands();
  const today = formatDate(new Date());

  const entries = [
    {
      url: `${BASE_URL}/uk/brands`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        uk: `${BASE_URL}/uk/brands`,
        ru: `${BASE_URL}/ru/brands`,
        'x-default': `${BASE_URL}/uk/brands`,
      },
    },
    ...brands.map((b) => ({
      url: `${BASE_URL}/uk/brand/${b.handle}`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        uk: `${BASE_URL}/uk/brand/${b.handle}`,
        ru: `${BASE_URL}/ru/brand/${b.handle}`,
        'x-default': `${BASE_URL}/uk/brand/${b.handle}`,
      },
    })),
  ];

  return xmlResponse(generateUrlsetXml(entries));
}
