// Shared configuration for all load tests
// Copy .env.load-test.example → .env.load-test and fill in values
// Run: k6 run --env-file .env.load-test tests/load/01-auth-stress.js

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
export const LOAD_TEST_SECRET = __ENV.LOAD_TEST_SECRET || '';

// A real product variant ID from your Shopify store
// Get it from: Shopify Admin → Products → any product → copy variant GID
export const TEST_VARIANT_ID = __ENV.TEST_VARIANT_ID || 'gid://shopify/ProductVariant/REPLACE_ME';

// Thresholds used across tests
export const DEFAULT_THRESHOLDS = {
  http_req_duration: ['p(95)<3000'],   // 95% of requests under 3s
  http_req_failed: ['rate<0.05'],       // less than 5% errors
};

export function randomEmail() {
  return `loadtest+${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export function randomPassword() {
  return 'Test1234!';
}

export const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};
