import { cacheLife } from 'next/cache';

const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const POSTHOG_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

/**
 * Query PostHog for unique users who viewed a specific product page
 * in the last 5 minutes.
 */
export async function getActiveViewers(productPath: string): Promise<number> {
  'use cache';
  cacheLife({ stale: 30, revalidate: 30, expire: 120 });

  if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) return 0;

  try {
    const res = await fetch(
      `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${POSTHOG_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: {
            kind: 'HogQLQuery',
            query: `SELECT count(DISTINCT person_id) FROM events WHERE event = '$pageview' AND properties.$current_url LIKE '%${productPath}%' AND timestamp > now() - INTERVAL 5 MINUTE`,
          },
        }),
      },
    );

    if (!res.ok) return 0;

    const data = await res.json();
    // HogQL returns results as [[value]]
    const count = data?.results?.[0]?.[0] ?? 0;
    return typeof count === 'number' ? count : parseInt(count, 10) || 0;
  } catch {
    return 0;
  }
}
