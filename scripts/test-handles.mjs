import { writeFileSync } from 'fs';
import { resolve } from 'path';
import dotenv from 'dotenv';

// Load env — .env first, then .env.local overrides
dotenv.config({ path: resolve(process.cwd(), '.env') });
dotenv.config({ path: resolve(process.cwd(), '.env.local'), override: true });

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_SECRET_TOKEN;
const VERSION = (process.env.SHOPIFY_API_VERSION || '').trim();

if (!DOMAIN || !TOKEN || !VERSION) {
  console.error('Missing env: SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_SECRET_TOKEN, or SHOPIFY_API_VERSION');
  process.exit(1);
}

const API_URL = `https://${DOMAIN}/api/${VERSION}/graphql.json`;

const PRODUCTS_QUERY = `
  query GetProducts($cursor: String) {
    products(first: 250, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        handle
        title
        vendor
        productType
      }
    }
  }
`;

async function fetchPage(cursor = null) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Shopify-Storefront-Private-Token': TOKEN,
    },
    body: JSON.stringify({ query: PRODUCTS_QUERY, variables: { cursor } }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data.products;
}

const delay = ms => new Promise(r => setTimeout(r, ms));

// Paginate through all products
const all = [];
let cursor = null;
let page = 1;

console.log(`Fetching all products from ${API_URL}...\n`);

do {
  process.stdout.write(`Page ${page}... `);
  const { pageInfo, nodes } = await fetchPage(cursor);
  all.push(...nodes);
  console.log(`${nodes.length} products (total so far: ${all.length})`);
  cursor = pageInfo.hasNextPage ? pageInfo.endCursor : null;
  page++;
  if (cursor) await delay(300);
} while (cursor);

console.log(`\nTotal products: ${all.length}\n`);

// Classify each product by data completeness for the commercial template:
// Full:      productType + vendor + title  → "{productType} {vendor} {title} | MioMio"
// NoType:    vendor + title (no productType) → "{vendor} {title} | MioMio"
// NoVendor:  productType + title (no vendor) → "{productType} {title} | MioMio"
// TitleOnly: title only (no type, no vendor) → "{title} | MioMio"

const full = [];
const noType = [];
const noVendor = [];
const titleOnly = [];

for (const p of all) {
  const hasType = p.productType && p.productType.trim() !== '';
  const hasVendor = p.vendor && p.vendor.trim() !== '';
  if (hasType && hasVendor) full.push(p);
  else if (!hasType && hasVendor) noType.push(p);
  else if (hasType && !hasVendor) noVendor.push(p);
  else titleOnly.push(p);
}

// Output helpers
const fmt = p => `${p.handle}\t${p.vendor || '(empty)'}\t${p.productType || '(empty)'}\t${p.title}`;
const header = 'handle\tvendor\tproductType\ttitle';

writeFileSync(
  resolve(process.cwd(), 'scripts/handles-full.txt'),
  [header, ...full.map(fmt)].join('\n'),
  'utf-8'
);
writeFileSync(
  resolve(process.cwd(), 'scripts/handles-no-type.txt'),
  [header, ...noType.map(fmt)].join('\n'),
  'utf-8'
);
writeFileSync(
  resolve(process.cwd(), 'scripts/handles-no-vendor.txt'),
  [header, ...noVendor.map(fmt)].join('\n'),
  'utf-8'
);
writeFileSync(
  resolve(process.cwd(), 'scripts/handles-title-only.txt'),
  [header, ...titleOnly.map(fmt)].join('\n'),
  'utf-8'
);

console.log('=== SEO Template Coverage Report ===\n');
console.log(`✓ Full template ({type} {vendor} {title} | MioMio):  ${full.length}`);
console.log(`⚠ Missing productType ({vendor} {title} | MioMio):   ${noType.length}`);
console.log(`⚠ Missing vendor ({type} {title} | MioMio):          ${noVendor.length}`);
console.log(`✗ Title only ({title} | MioMio):                      ${titleOnly.length}`);
console.log(`\nTotal: ${all.length}`);
console.log('\nOutput files:');
console.log('  scripts/handles-full.txt       — full commercial template');
console.log('  scripts/handles-no-type.txt    — missing productType (needs fix in Shopify)');
console.log('  scripts/handles-no-vendor.txt  — missing vendor (needs fix in Shopify)');
console.log('  scripts/handles-title-only.txt — missing both type and vendor (needs fix in Shopify)');
