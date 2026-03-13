import {
  generateUrlsetXml,
  xmlResponse,
  formatDate,
  BASE_URL,
} from '@shared/lib/sitemap/xml';


interface StaticPage {
  path: string;
  priority: number;
}

const STATIC_PAGES: StaticPage[] = [
  { path: '/uk', priority: 1.0 },
  { path: '/uk/woman', priority: 1.0 },
  { path: '/uk/man', priority: 1.0 },
  { path: '/uk/brands', priority: 0.8 },
  { path: '/uk/blog', priority: 0.7 },
  { path: '/uk/info/contacts', priority: 0.5 },
  { path: '/uk/info/delivery', priority: 0.5 },
  { path: '/uk/info/payment-returns', priority: 0.5 },
  { path: '/uk/info/public-offer-agreement', priority: 0.4 },
  { path: '/uk/info/privacy-policy', priority: 0.4 },
];

export async function GET() {
  const today = formatDate(new Date());

  const entries = STATIC_PAGES.map((p) => ({
    url: `${BASE_URL}${p.path}`,
    lastModified: today,
    changeFrequency: p.priority >= 1.0 ? 'daily' : 'monthly',
    priority: p.priority,
    alternates: {
      uk: `${BASE_URL}${p.path}`,
      ru: `${BASE_URL}${p.path.replace('/uk/', '/ru/')}`,
      'x-default': `${BASE_URL}${p.path}`,
    },
  }));

  return xmlResponse(generateUrlsetXml(entries));
}
