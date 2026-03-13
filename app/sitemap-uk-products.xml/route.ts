import {
  generateUrlsetXml,
  xmlResponse,
  formatDate,
  BASE_URL,
} from '@shared/lib/sitemap/xml';
import { getSitemapProducts } from '@shared/lib/sitemap/data';


export async function GET() {
  const products = await getSitemapProducts();

  const entries = products.map((p) => ({
    url: `${BASE_URL}/uk/product/${p.handle}`,
    lastModified: formatDate(p.updatedAt),
    changeFrequency: 'daily',
    priority: 0.8,
    alternates: {
      uk: `${BASE_URL}/uk/product/${p.handle}`,
      ru: `${BASE_URL}/ru/product/${p.handle}`,
      'x-default': `${BASE_URL}/uk/product/${p.handle}`,
    },
  }));

  return xmlResponse(generateUrlsetXml(entries));
}
