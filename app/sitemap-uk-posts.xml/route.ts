import { generateUrlsetXml, xmlResponse, formatDate, BASE_URL } from '@shared/lib/sitemap/xml';
import { getSitemapPosts } from '@shared/lib/sitemap/data';

export async function GET() {
  const posts = await getSitemapPosts();
  const ukPosts = posts.filter((p) => !p.language || p.language === 'uk');

  const entries = ukPosts.map((p) => ({
    url: `${BASE_URL}/uk/blog/${p.slug}`,
    lastModified: formatDate(p.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
    alternates: {
      uk: `${BASE_URL}/uk/blog/${p.slug}`,
      ru: `${BASE_URL}/ru/blog/${p.slug}`,
      'x-default': `${BASE_URL}/uk/blog/${p.slug}`,
    },
  }));

  return xmlResponse(generateUrlsetXml(entries));
}
