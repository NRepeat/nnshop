/**
 * Cart stress test — 100 concurrent users adding products to cart
 *
 * Tests:
 *  - Session creation
 *  - POST /api/internal/cart (add to cart → Shopify Storefront API + DB)
 *  - Repeated adds (increment qty path)
 *
 * Exposes Shopify Storefront API rate limits and DB connection pool pressure.
 *
 * Run: k6 run --env-file tests/load/.env.load-test tests/load/02-cart-stress.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import {
  BASE_URL,
  AUTH_HEADERS,
  DEFAULT_THRESHOLDS,
  LOAD_TEST_SECRET,
  TEST_VARIANT_ID,
  randomEmail,
  randomPassword,
} from './config.js';

const cartAddDuration = new Trend('cart_add_duration', true);
const cartErrors = new Counter('cart_errors');

export const options = {
  scenarios: {
    cart_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '60s', target: 100 },  // sustained load
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    ...DEFAULT_THRESHOLDS,
    cart_add_duration: ['p(95)<4000'],  // Shopify API can be slow
    cart_errors: ['count<10'],
  },
};

export function setup() {
  // Pre-create 100 users to avoid mixing auth + cart load in the main test
  const users = [];
  for (let i = 0; i < 100; i++) {
    const email = randomEmail();
    const password = randomPassword();
    const jar = http.cookieJar();

    const res = http.post(
      `${BASE_URL}/api/auth/sign-up/email`,
      JSON.stringify({ email, password, name: 'Load Test User' }),
      { headers: AUTH_HEADERS, jar },
    );

    if (res.status === 200) {
      // Extract session token from cookie
      const cookie = res.cookies['better-auth.session_token'];
      if (cookie && cookie[0]) {
        users.push({ email, password, sessionToken: cookie[0].value });
      }
    }
  }
  console.log(`Setup: created ${users.length} test users`);
  return { users };
}

export default function ({ users }) {
  // Pick a random pre-created user
  const user = users[Math.floor(Math.random() * users.length)];
  if (!user) return;

  const headers = {
    ...AUTH_HEADERS,
    'x-load-test-key': LOAD_TEST_SECRET,
    'Cookie': `better-auth.session_token=${user.sessionToken}`,
  };

  // Add to cart
  const addRes = http.post(
    `${BASE_URL}/api/internal/cart`,
    JSON.stringify({ variantId: TEST_VARIANT_ID }),
    { headers, tags: { name: 'cart-add' } },
  );

  cartAddDuration.add(addRes.timings.duration);

  const ok = check(addRes, {
    'cart-add: status 200': (r) => r.status === 200,
    'cart-add: success true': (r) => {
      try { return JSON.parse(r.body).success === true; } catch { return false; }
    },
  });

  if (!ok) {
    cartErrors.add(1);
    console.error(`Cart add failed [${addRes.status}]: ${addRes.body}`);
  }

  sleep(1);

  // Second add — tests the "increment existing line" path
  const addRes2 = http.post(
    `${BASE_URL}/api/internal/cart`,
    JSON.stringify({ variantId: TEST_VARIANT_ID }),
    { headers, tags: { name: 'cart-add-increment' } },
  );

  check(addRes2, {
    'cart-increment: status 200': (r) => r.status === 200,
  });

  sleep(1);
}

export function teardown({ users }) {
  console.log(`Teardown: ${users.length} test users created. Clean up with:
  DELETE FROM "User" WHERE email LIKE 'loadtest+%@example.com';
  DELETE FROM "Cart" WHERE "userId" IN (SELECT id FROM "User" WHERE email LIKE 'loadtest+%@example.com');`);
}
