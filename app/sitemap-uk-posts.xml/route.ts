import { generateUrlsetXml, xmlResponse, formatDate, BASE_URL } from '@shared/lib/sitemap/xml';
import { getSitemapPosts } from '@shared/lib/sitemap/data';

export async function GET() {
  const posts = await getSitemapPosts();
  const ukPosts = posts.filter((p) => !p.language || p.language === 'uk' || p.language === 'ua');

  const entries = ukPosts.map((p) => {
    const ruTranslation = p.translations?.find((t) => t.language === 'ru');
    const alternates: Record<string, string> = {
      uk: `${BASE_URL}/uk/blog/${p.slug}`,
      'x-default': `${BASE_URL}/uk/blog/${p.slug}`,
    };

    if (ruTranslation) {
      alternates.ru = `${BASE_URL}/ru/blog/${ruTranslation.slug}`;
    } else if (!p.language) {
      // If the post has no language set, it's considered available in both
      alternates.ru = `${BASE_URL}/ru/blog/${p.slug}`;
    }

    return {
      url: `${BASE_URL}/uk/blog/${p.slug}`,
      lastModified: formatDate(p.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates,
    };
  });

  return xmlResponse(generateUrlsetXml(entries));
}
