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
  { path: '/ru', priority: 1.0 },
  { path: '/ru/woman', priority: 1.0 },
  { path: '/ru/man', priority: 1.0 },
  { path: '/ru/brands', priority: 0.8 },
  { path: '/ru/blog', priority: 0.7 },
  { path: '/ru/info/contacts', priority: 0.5 },
  { path: '/ru/info/delivery', priority: 0.5 },
  { path: '/ru/info/payment-returns', priority: 0.5 },
  { path: '/ru/info/public-offer-agreement', priority: 0.4 },
  { path: '/ru/info/privacy-policy', priority: 0.4 },
];

export async function GET() {
  const today = formatDate(new Date());

  const entries = STATIC_PAGES.map((p) => ({
    url: `${BASE_URL}${p.path}`,
    lastModified: today,
    changeFrequency: p.priority >= 1.0 ? 'daily' : 'monthly',
    priority: p.priority,
    alternates: {
      uk: `${BASE_URL}${p.path.replace('/ru/', '/uk/')}`,
      ru: `${BASE_URL}${p.path}`,
      'x-default': `${BASE_URL}${p.path.replace('/ru/', '/uk/')}`,
    },
  }));

  return xmlResponse(generateUrlsetXml(entries));
}
