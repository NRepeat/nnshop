/**
 * Page render stress test — 100 concurrent users browsing collection and product pages
 *
 * Tests:
 *  - GET /uk/woman (home redirect)
 *  - GET /uk/woman/[collection-slug] (collection page with products + filters)
 *  - GET /uk/product/[product-slug] (product page with inventory fetch)
 *
 * This is usually the highest traffic scenario and tests:
 *  - Next.js RSC rendering under load
 *  - Shopify Storefront API cache behavior
 *  - Sanity CMS response times
 *
 * Run: k6 run --env-file tests/load/.env.load-test tests/load/03-pages-stress.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { BASE_URL, DEFAULT_THRESHOLDS } from './config.js';

// Set these to real slugs from your store
const COLLECTION_SLUGS = (__ENV.COLLECTION_SLUGS || 'new-arrivals,sale,bestsellers').split(',');
const PRODUCT_SLUGS = (__ENV.PRODUCT_SLUGS || 'example-product').split(',');

const collectionDuration = new Trend('collection_page_duration', true);
const productDuration = new Trend('product_page_duration', true);
const homeDuration = new Trend('home_page_duration', true);

export const options = {
  scenarios: {
    browse: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '60s', target: 100 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    ...DEFAULT_THRESHOLDS,
    collection_page_duration: ['p(95)<5000'],
    product_page_duration: ['p(95)<5000'],
    home_page_duration: ['p(95)<3000'],
  },
};

export default function () {
  const pageHeaders = { 'Accept': 'text/html' };

  // 1. Home page
  const homeRes = http.get(`${BASE_URL}/uk/woman`, {
    headers: pageHeaders,
    tags: { name: 'home' },
    redirects: 3,
  });
  homeDuration.add(homeRes.timings.duration);
  check(homeRes, { 'home: status 200': (r) => r.status === 200 });

  sleep(Math.random() * 2 + 1);

  // 2. Collection page
  const collectionSlug = COLLECTION_SLUGS[Math.floor(Math.random() * COLLECTION_SLUGS.length)];
  const collectionRes = http.get(`${BASE_URL}/uk/woman/${collectionSlug}`, {
    headers: pageHeaders,
    tags: { name: 'collection' },
  });
  collectionDuration.add(collectionRes.timings.duration);
  check(collectionRes, {
    'collection: status 200': (r) => r.status === 200,
    'collection: has products': (r) => r.body.includes('product'),
  });

  sleep(Math.random() * 3 + 1);

  // 3. Product page
  const productSlug = PRODUCT_SLUGS[Math.floor(Math.random() * PRODUCT_SLUGS.length)];
  const productRes = http.get(`${BASE_URL}/uk/product/${productSlug}`, {
    headers: pageHeaders,
    tags: { name: 'product' },
  });
  productDuration.add(productRes.timings.duration);
  check(productRes, { 'product: status 200': (r) => r.status === 200 });

  sleep(Math.random() * 2 + 1);
}
