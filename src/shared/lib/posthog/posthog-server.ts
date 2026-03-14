import { PostHog } from 'posthog-node';
import { logger } from './logger';

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

export async function captureServerError(
  error: unknown,
  context: {
    service: 'auth' | 'cart' | 'checkout' | 'product' | 'api' | 'prisma';
    action: string;
    userId?: string;
    extra?: Record<string, unknown>;
  },
) {
  const client = getPostHogClient();
  if (!client) return;

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  logger.error(`${context.service}:${context.action} — ${errorMessage}`, {
    service: context.service,
    action: context.action,
    user_id: context.userId,
    stack: errorStack,
    ...Object.fromEntries(
      Object.entries(context.extra ?? {}).map(([k, v]) => [k, String(v)]),
    ),
  });

  client.capture({
    distinctId: context.userId ?? 'server_system',
    event: 'server_error',
    properties: {
      service: context.service,
      action: context.action,
      message: errorMessage,
      stack: errorStack,
      ...context.extra,
      $exception_message: errorMessage,
      $exception_type: 'ServerError',
    },
  });

  await client.flush();
}
