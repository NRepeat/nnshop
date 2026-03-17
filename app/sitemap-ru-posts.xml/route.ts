import { generateUrlsetXml, xmlResponse, formatDate, BASE_URL } from '@shared/lib/sitemap/xml';
import { getSitemapPosts } from '@shared/lib/sitemap/data';

export async function GET() {
  const posts = await getSitemapPosts();
  const ruPosts = posts.filter((p) => !p.language || p.language === 'ru');

  const entries = ruPosts.map((p) => {
    const ukTranslation = p.translations?.find((t) => t.language === 'uk' || t.language === 'ua');
    const alternates: Record<string, string> = {
      ru: `${BASE_URL}/ru/blog/${p.slug}`,
    };

    if (ukTranslation) {
      alternates.uk = `${BASE_URL}/uk/blog/${ukTranslation.slug}`;
      alternates['x-default'] = `${BASE_URL}/uk/blog/${ukTranslation.slug}`;
    } else if (!p.language) {
      // If the post has no language set, it's considered available in both
      alternates.uk = `${BASE_URL}/uk/blog/${p.slug}`;
      alternates['x-default'] = `${BASE_URL}/uk/blog/${p.slug}`;
    }

    return {
      url: `${BASE_URL}/ru/blog/${p.slug}`,
      lastModified: formatDate(p.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates,
    };
  });

  return xmlResponse(generateUrlsetXml(entries));
}
