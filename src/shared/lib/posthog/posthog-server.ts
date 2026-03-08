import { PostHog } from 'posthog-node';

let _client: PostHog | null = null;

function getPostHogClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  if (!_client) {
    _client = new PostHog(key, { host: 'https://us.i.posthog.com' });
  }
  return _client;
}

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
) {
  const client = getPostHogClient();
  if (!client) {
    console.warn('[PostHog] Server client not initialized — missing env vars');
    return;
  }
  client.capture({ distinctId, event, properties });
  await client.flush();
}
