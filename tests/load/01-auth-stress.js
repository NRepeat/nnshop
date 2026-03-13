/**
 * Auth stress test — 100 concurrent users registering and signing in
 *
 * Tests:
 *  - POST /api/auth/sign-up/email
 *  - POST /api/auth/sign-in/email
 *  - Session cookie persistence
 *
 * Run: k6 run --env-file tests/load/.env.load-test tests/load/01-auth-stress.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { BASE_URL, AUTH_HEADERS, DEFAULT_THRESHOLDS, randomEmail, randomPassword } from './config.js';

const signUpDuration = new Trend('sign_up_duration', true);
const signInDuration = new Trend('sign_in_duration', true);
const signUpErrors = new Counter('sign_up_errors');
const signInErrors = new Counter('sign_in_errors');

export const options = {
  scenarios: {
    registration: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 50 },   // ramp up to 50 users
        { duration: '30s', target: 100 },  // ramp up to 100 users
        { duration: '30s', target: 100 },  // hold 100 users
        { duration: '15s', target: 0 },    // ramp down
      ],
    },
  },
  thresholds: {
    ...DEFAULT_THRESHOLDS,
    sign_up_duration: ['p(95)<2000'],
    sign_in_duration: ['p(95)<1000'],
  },
};

export default function () {
  const email = randomEmail();
  const password = randomPassword();
  const jar = http.cookieJar();

  // 1. Register
  const signUpRes = http.post(
    `${BASE_URL}/api/auth/sign-up/email`,
    JSON.stringify({ email, password, name: 'Load Test User' }),
    { headers: AUTH_HEADERS, jar, tags: { name: 'sign-up' } },
  );

  signUpDuration.add(signUpRes.timings.duration);

  const signUpOk = check(signUpRes, {
    'sign-up: status 200': (r) => r.status === 200,
    'sign-up: has session cookie': (r) => r.cookies['better-auth.session_token'] !== undefined,
  });

  if (!signUpOk) {
    signUpErrors.add(1);
    console.error(`Sign-up failed [${signUpRes.status}]: ${signUpRes.body}`);
    return;
  }

  sleep(0.5);

  // 2. Sign in with the same credentials
  const signInRes = http.post(
    `${BASE_URL}/api/auth/sign-in/email`,
    JSON.stringify({ email, password }),
    { headers: AUTH_HEADERS, jar, tags: { name: 'sign-in' } },
  );

  signInDuration.add(signInRes.timings.duration);

  const signInOk = check(signInRes, {
    'sign-in: status 200': (r) => r.status === 200,
    'sign-in: has session cookie': (r) => r.cookies['better-auth.session_token'] !== undefined,
  });

  if (!signInOk) {
    signInErrors.add(1);
    console.error(`Sign-in failed [${signInRes.status}]: ${signInRes.body}`);
  }

  sleep(1);
}
