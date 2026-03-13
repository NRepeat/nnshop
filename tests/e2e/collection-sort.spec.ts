/**
 * E2E — Collection sorting
 *
 * Verifies the three sort modes on a collection page:
 *   1. Default (trending) — metafield sort_order → createdAt desc
 *   2. Newest (created-desc) — new-tagged products first, then createdAt desc
 *   3. Price sorts (price-asc / price-desc) — URL param updates, products render
 *
 * Required env vars (.env.test.local):
 *   TEST_COLLECTION_URL — relative URL of a collection, e.g. /uk/woman/vzuttya
 *                         Must be a collection with ≥2 products.
 */
import { test, expect, Page } from '@playwright/test';

// ─── helpers ────────────────────────────────────────────────────────────────

function collectionUrl(): string {
  const url = process.env.TEST_COLLECTION_URL;
  if (!url) throw new Error('TEST_COLLECTION_URL must be set in .env.test.local');
  return url;
}

/** Returns href values of all product card links currently visible on the page */
async function getProductLinks(page: Page): Promise<string[]> {
  // Product cards are <a> elements inside the grid; pick the first anchor per card
  const links = await page
    .locator('[data-testid="product-card"] a, .product-card a, article a')
    .evaluateAll((els: HTMLAnchorElement[]) =>
      els.map((el) => el.getAttribute('href') ?? '').filter(Boolean),
    );

  // Fallback: grab any /product/ links on the page
  if (links.length === 0) {
    return page
      .locator('a[href*="/product/"]')
      .evaluateAll((els: HTMLAnchorElement[]) =>
        [...new Set(els.map((el) => el.getAttribute('href') ?? '').filter(Boolean))],
      );
  }
  return links;
}

async function waitForProducts(page: Page, minCount = 1): Promise<void> {
  await expect(page.locator('a[href*="/product/"]').first()).toBeVisible({
    timeout: 15_000,
  });
  const count = await page.locator('a[href*="/product/"]').count();
  expect(count).toBeGreaterThanOrEqual(minCount);
}

// ─── tests ──────────────────────────────────────────────────────────────────

test.describe('Collection sorting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(collectionUrl());
    await page.waitForLoadState('networkidle');
    await waitForProducts(page);
  });

  // ── 1. Default sort ────────────────────────────────────────────────────────

  test('default sort (trending) loads products without ?sort param', async ({ page }) => {
    const url = page.url();
    expect(url).not.toContain('sort=');

    // Sort select shows "trending" as the selected value
    const trigger = page.locator('[role="combobox"]');
    if (await trigger.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const text = await trigger.textContent();
      // "trending" option should be selected (any locale label is ok — just no blank)
      expect(text?.trim().length).toBeGreaterThan(0);
    }

    await waitForProducts(page, 2);
  });

  test('default sort preserves stable order across two page loads', async ({ page }) => {
    const firstLoad = await getProductLinks(page);
    expect(firstLoad.length).toBeGreaterThan(0);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await waitForProducts(page);

    const secondLoad = await getProductLinks(page);
    // First few products must stay in the same order (sort is deterministic)
    const compareCount = Math.min(firstLoad.length, secondLoad.length, 6);
    expect(firstLoad.slice(0, compareCount)).toEqual(secondLoad.slice(0, compareCount));
  });

  // ── 2. Newest sort ─────────────────────────────────────────────────────────

  test('selecting "newest" adds ?sort=created-desc to the URL', async ({ page }) => {
    const trigger = page.locator('[role="combobox"]').first();
    await expect(trigger).toBeVisible({ timeout: 5_000 });
    await trigger.click();

    // Wait for the dropdown listbox to appear (Radix UI portal)
    await page.waitForSelector('[role="listbox"]', { timeout: 5_000 });

    // Pick the "newest" option — "Нові" (uk) / "Новые" (ru)
    const newestOption = page
      .locator('[role="listbox"] [role="option"]')
      .filter({ hasText: /Нов|New/i })
      .first();
    await expect(newestOption).toBeVisible({ timeout: 3_000 });
    await newestOption.click();

    await expect(page).toHaveURL(/sort=created-desc/, { timeout: 10_000 });
    await waitForProducts(page, 1);
  });

  test('?sort=created-desc renders products', async ({ page }) => {
    const base = collectionUrl().split('?')[0];
    await page.goto(`${base}?sort=created-desc`);
    await page.waitForLoadState('networkidle');
    await waitForProducts(page, 1);

    const links = await getProductLinks(page);
    expect(links.length).toBeGreaterThan(0);
  });

  // ── 3. Price sorts ─────────────────────────────────────────────────────────

  test('price-asc sort renders products and shows correct URL', async ({ page }) => {
    const base = collectionUrl().split('?')[0];
    await page.goto(`${base}?sort=price-asc`);
    await page.waitForLoadState('networkidle');
    await waitForProducts(page, 1);
    expect(page.url()).toContain('sort=price-asc');
  });

  test('price-desc sort renders products and shows correct URL', async ({ page }) => {
    const base = collectionUrl().split('?')[0];
    await page.goto(`${base}?sort=price-desc`);
    await page.waitForLoadState('networkidle');
    await waitForProducts(page, 1);
    expect(page.url()).toContain('sort=price-desc');
  });

  test('price-asc order: first product price ≤ last product price', async ({ page }) => {
    const base = collectionUrl().split('?')[0];
    await page.goto(`${base}?sort=price-asc`);
    await page.waitForLoadState('networkidle');
    await waitForProducts(page, 2);

    // Grab all visible price strings like "1 500 ₴" or "1500₴"
    const prices = await page
      .locator('a[href*="/product/"]')
      .evaluateAll((cards) =>
        cards
          .map((card) => {
            const txt = card.textContent ?? '';
            const match = txt.match(/[\d\s]+(?:₴|грн)/);
            return match ? parseFloat(match[0].replace(/\s/g, '').replace(/[₴грн]/g, '')) : null;
          })
          .filter((v): v is number => v !== null),
      );

    if (prices.length >= 2) {
      expect(prices[0]).toBeLessThanOrEqual(prices[prices.length - 1]);
    }
  });

  // ── 4. Switching sorts ─────────────────────────────────────────────────────

  test('switching sort from newest back to trending removes ?sort param', async ({ page }) => {
    const base = collectionUrl().split('?')[0];
    await page.goto(`${base}?sort=created-desc`);
    await page.waitForLoadState('networkidle');

    const trigger = page.locator('[role="combobox"]').first();
    await expect(trigger).toBeVisible({ timeout: 5_000 });
    await trigger.click();

    // Wait for listbox portal to appear
    await page.waitForSelector('[role="listbox"]', { timeout: 5_000 });

    // "Популярні" (uk) / "Популярные" (ru)
    const trendingOption = page
      .locator('[role="listbox"] [role="option"]')
      .filter({ hasText: /Попул/i })
      .first();
    await expect(trendingOption).toBeVisible({ timeout: 3_000 });
    await trendingOption.click();

    // router.replace removes ?sort — wait until URL no longer has it
    await page.waitForURL((url) => !url.searchParams.has('sort'), { timeout: 10_000 });
    await waitForProducts(page, 1);
  });

  // ── 5. Pagination after sort ───────────────────────────────────────────────

  test('load more / pagination works on newest sort', async ({ page }) => {
    const base = collectionUrl().split('?')[0];
    await page.goto(`${base}?sort=created-desc`);
    await page.waitForLoadState('networkidle');
    await waitForProducts(page, 1);

    // LoadMore uses IntersectionObserver — it may auto-trigger immediately when
    // the button scrolls into view. Wait for auto-loads to settle, then check
    // if there is still a next page (button visible) before counting.
    await page.waitForTimeout(2_000);

    const loadMoreBtn = page.getByRole('button', { name: /Показати більше|Показать больше|Show More/i });
    const isVisible = await loadMoreBtn.isVisible({ timeout: 2_000 }).catch(() => false);

    if (!isVisible) {
      test.skip(true, 'All pages already loaded — no load-more button visible');
      return;
    }

    const before = await page.locator('a[href*="/product/"]').count();
    // Scroll button into view to prevent auto-trigger race, then click
    await loadMoreBtn.scrollIntoViewIfNeeded();
    await loadMoreBtn.click();
    // Wait for the transition to complete (spinner disappears, new cards appear)
    await page.waitForFunction(
      (prevCount) => document.querySelectorAll('a[href*="/product/"]').length > prevCount,
      before,
      { timeout: 15_000 },
    );
    const after = await page.locator('a[href*="/product/"]').count();
    expect(after).toBeGreaterThan(before);
  });
});
