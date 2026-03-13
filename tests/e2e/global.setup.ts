/**
 * Global setup: authenticate the test user via the better-auth API and
 * persist the session cookies to disk. All checkout tests reuse this session.
 *
 * Using the API directly (not UI) avoids locale/CAPTCHA/redirect edge cases
 * and works regardless of whether the dev server's NEXT_PUBLIC_BASE_URL
 * matches the test base URL.
 *
 * Required env vars (in .env.test.local):
 *   TEST_USER_EMAIL    — email of the test account (will be created if missing)
 *   TEST_USER_PASSWORD — password for that account
 */
import { test as setup } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '.auth/user.json');

setup('authenticate test user', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  const base = process.env.TEST_BASE_URL || 'http://localhost:3001';

  if (!email || !password) {
    throw new Error(
      'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.test.local',
    );
  }

  // Use page.request so cookies are shared with the browser context
  // 1. Try to sign in via better-auth API
  let signInRes = await page.request.post(`${base}/api/auth/sign-in/email`, {
    data: { email, password, rememberMe: true },
    headers: { 'Content-Type': 'application/json' },
  });

  // 2. If user doesn't exist (4xx), sign up first then sign in
  if (!signInRes.ok()) {
    const signUpRes = await page.request.post(`${base}/api/auth/sign-up/email`, {
      data: { email, password, name: 'Test User' },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!signUpRes.ok()) {
      const body = await signUpRes.text();
      throw new Error(`Sign-up failed (${signUpRes.status()}): ${body}`);
    }

    signInRes = await page.request.post(`${base}/api/auth/sign-in/email`, {
      data: { email, password, rememberMe: true },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!signInRes.ok()) {
    const body = await signInRes.text();
    throw new Error(`Sign-in failed (${signInRes.status()}): ${body}`);
  }

  // 3. Navigate to a page to flush cookies into the browser context
  await page.goto(`${base}/uk`);
  await page.waitForLoadState('networkidle');

  // 4. Save full storage state (cookies + localStorage)
  await page.context().storageState({ path: AUTH_FILE });
});
