export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua';

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: string;
  priority?: number;
  alternates?: Record<string, string>;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toISOString().split('T')[0];
}

export function generateSitemapIndexXml(
  entries: { url: string; lastModified?: string }[],
): string {
  const items = entries
    .map(
      (e) =>
        `  <sitemap>\n    <loc>${e.url}</loc>${
          e.lastModified ? `\n    <lastmod>${e.lastModified}</lastmod>` : ''
        }\n  </sitemap>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>`;
}

export function generateUrlsetXml(entries: SitemapEntry[]): string {
  const items = entries
    .map((e) => {
      const alternateLinks = e.alternates
        ? Object.entries(e.alternates)
            .map(
              ([lang, href]) =>
                `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`,
            )
            .join('\n')
        : '';
      return (
        `  <url>\n    <loc>${e.url}</loc>` +
        (e.lastModified ? `\n    <lastmod>${e.lastModified}</lastmod>` : '') +
        (e.changeFrequency
          ? `\n    <changefreq>${e.changeFrequency}</changefreq>`
          : '') +
        (e.priority !== undefined
          ? `\n    <priority>${e.priority}</priority>`
          : '') +
        (alternateLinks ? `\n${alternateLinks}` : '') +
        `\n  </url>`
      );
    })
    .join('\n');
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    `${items}\n` +
    `</urlset>`
  );
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
