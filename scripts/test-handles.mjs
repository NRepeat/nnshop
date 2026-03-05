import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import dotenv from 'dotenv';

// Load env files — .env first, then .env.local overrides
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

const TSV_FILE = resolve(
  process.cwd(),
  '.planning/02-2026 _ Додаток до аналізу нового сайту _ https___www.miomio.com.ua_ - Description outside head.tsv'
);

// Parse TSV — first column is Address, skip header row
const raw = readFileSync(TSV_FILE, 'utf-8');
const lines = raw.split('\n').slice(1); // skip header

const handles = lines
  .map(line => line.split('\t')[0]?.trim())
  .filter(Boolean)
  .map(url => {
    const parts = url.split('/product/');
    return parts.length > 1 ? decodeURIComponent(parts[1].split('?')[0]) : null;
  })
  .filter(Boolean);

console.log(`Testing ${handles.length} handles against ${API_URL}`);

const QUERY = `
  query CheckHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
    }
  }
`;

async function checkHandle(handle) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Shopify-Storefront-Private-Token': TOKEN,
    },
    body: JSON.stringify({ query: QUERY, variables: { handle } }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for handle: ${handle}`);
  }
  const json = await res.json();
  return json.data?.product ?? null;
}

const delay = ms => new Promise(r => setTimeout(r, ms));

const ok = [];
const missing = [];

for (let i = 0; i < handles.length; i++) {
  const handle = handles[i];
  try {
    const product = await checkHandle(handle);
    if (product) {
      ok.push(handle);
      process.stdout.write(`[${i + 1}/${handles.length}] OK: ${handle}\n`);
    } else {
      missing.push(handle);
      process.stdout.write(`[${i + 1}/${handles.length}] MISSING: ${handle}\n`);
    }
  } catch (err) {
    missing.push(handle);
    process.stdout.write(`[${i + 1}/${handles.length}] ERROR: ${handle} — ${err.message}\n`);
  }
  // Rate-limit: 2 req/s (conservative — avoid Shopify 429)
  if (i < handles.length - 1) await delay(500);
}

writeFileSync(resolve(process.cwd(), 'scripts/handles-ok.txt'), ok.join('\n'), 'utf-8');
writeFileSync(resolve(process.cwd(), 'scripts/handles-missing.txt'), missing.join('\n'), 'utf-8');

console.log(`\nDone. OK: ${ok.length}, Missing: ${missing.length}`);
console.log('Results written to:');
console.log('  scripts/handles-ok.txt');
console.log('  scripts/handles-missing.txt');
