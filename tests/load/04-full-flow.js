/**
 * Full user journey — 100 concurrent users doing the complete flow
 *
 * Flow per user:
 *  1. Register account
 *  2. Browse collection page
 *  3. Add product to cart
 *  4. View cart page
 *  5. Load checkout/info page
 *  6. Load checkout/delivery page
 *  7. Load checkout/payment page
 *
 * NOTE: Steps 5-7 are page loads only. Order creation is NOT performed
 * to avoid creating fake orders in Shopify. Use 02-cart-stress.js to
 * measure the cart add bottleneck separately.
 *
 * Run: k6 run --env-file tests/load/.env.load-test tests/load/04-full-flow.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import {
  BASE_URL,
  AUTH_HEADERS,
  DEFAULT_THRESHOLDS,
  LOAD_TEST_SECRET,
  TEST_VARIANT_ID,
  randomEmail,
  randomPassword,
} from './config.js';

const COLLECTION_SLUG = __ENV.COLLECTION_SLUG || 'new-arrivals';

const flowDuration = new Trend('full_flow_duration', true);
const flowErrors = new Counter('flow_errors');
const flowSuccessRate = new Rate('flow_success_rate');

export const options = {
  scenarios: {
    full_journey: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '60s', target: 100 },
        { duration: '20s', target: 0 },
      ],
    },
  },
  thresholds: {
    ...DEFAULT_THRESHOLDS,
    full_flow_duration: ['p(95)<15000'],  // full flow under 15s
    flow_success_rate: ['rate>0.90'],      // at least 90% success
    flow_errors: ['count<50'],
  },
};

export default function () {
  const start = Date.now();
  const jar = http.cookieJar();
  const email = randomEmail();
  const password = randomPassword();
  let sessionToken = null;
  let flowOk = true;

  // ── Step 1: Register ─────────────────────────────────────────────────────
  group('1_register', () => {
    const res = http.post(
      `${BASE_URL}/api/auth/sign-up/email`,
      JSON.stringify({ email, password, name: 'Load Test User' }),
      { headers: AUTH_HEADERS, jar, tags: { name: 'register' } },
    );

    const ok = check(res, {
      'register: 200': (r) => r.status === 200,
      'register: session cookie': (r) => !!r.cookies['better-auth.session_token'],
    });

    if (!ok) { flowOk = false; flowErrors.add(1); return; }
    sessionToken = res.cookies['better-auth.session_token']?.[0]?.value;
  });

  if (!flowOk || !sessionToken) { flowSuccessRate.add(false); return; }
  sleep(0.5);

  const authedHeaders = {
    'Content-Type': 'application/json',
    'Cookie': `better-auth.session_token=${sessionToken}`,
  };

  // ── Step 2: Browse collection ────────────────────────────────────────────
  group('2_browse_collection', () => {
    const res = http.get(
      `${BASE_URL}/uk/woman/${COLLECTION_SLUG}`,
      { headers: { Accept: 'text/html', Cookie: authedHeaders.Cookie }, tags: { name: 'collection' } },
    );
    check(res, { 'collection: 200': (r) => r.status === 200 });
  });

  sleep(Math.random() * 2 + 1);

  // ── Step 3: Add to cart ──────────────────────────────────────────────────
  group('3_add_to_cart', () => {
    const res = http.post(
      `${BASE_URL}/api/internal/cart`,
      JSON.stringify({ variantId: TEST_VARIANT_ID }),
      {
        headers: { ...authedHeaders, 'x-load-test-key': LOAD_TEST_SECRET },
        tags: { name: 'cart-add' },
      },
    );

    const ok = check(res, {
      'cart-add: 200': (r) => r.status === 200,
      'cart-add: success': (r) => {
        try { return JSON.parse(r.body).success === true; } catch { return false; }
      },
    });

    if (!ok) { flowOk = false; flowErrors.add(1); }
  });

  if (!flowOk) { flowSuccessRate.add(false); return; }
  sleep(0.5);

  // ── Step 4: View cart ────────────────────────────────────────────────────
  group('4_view_cart', () => {
    const res = http.get(
      `${BASE_URL}/uk/cart`,
      { headers: { Accept: 'text/html', Cookie: authedHeaders.Cookie }, tags: { name: 'cart-page' } },
    );
    check(res, { 'cart-page: 200': (r) => r.status === 200 });
  });

  sleep(0.5);

  // ── Step 5: Checkout info page ───────────────────────────────────────────
  group('5_checkout_info', () => {
    const res = http.get(
      `${BASE_URL}/uk/checkout/info`,
      { headers: { Accept: 'text/html', Cookie: authedHeaders.Cookie }, tags: { name: 'checkout-info' } },
    );
    // 200 or redirect to login is acceptable
    check(res, { 'checkout-info: loaded': (r) => r.status === 200 || r.status === 302 });
  });

  sleep(0.5);

  // ── Step 6: Checkout delivery page ──────────────────────────────────────
  group('6_checkout_delivery', () => {
    const res = http.get(
      `${BASE_URL}/uk/checkout/delivery`,
      { headers: { Accept: 'text/html', Cookie: authedHeaders.Cookie }, tags: { name: 'checkout-delivery' } },
    );
    check(res, { 'checkout-delivery: loaded': (r) => r.status === 200 || r.status === 302 });
  });

  sleep(0.5);

  // ── Step 7: Checkout payment page ────────────────────────────────────────
  group('7_checkout_payment', () => {
    const res = http.get(
      `${BASE_URL}/uk/checkout/payment`,
      { headers: { Accept: 'text/html', Cookie: authedHeaders.Cookie }, tags: { name: 'checkout-payment' } },
    );
    check(res, { 'checkout-payment: loaded': (r) => r.status === 200 || r.status === 302 });
  });

  flowDuration.add(Date.now() - start);
  flowSuccessRate.add(flowOk);

  sleep(1);
}

export function teardown() {
  console.log(`
Cleanup test users:
  DELETE FROM "Cart" WHERE "userId" IN (SELECT id FROM "User" WHERE email LIKE 'loadtest+%@example.com');
  DELETE FROM "User" WHERE email LIKE 'loadtest+%@example.com';
  `);
}
