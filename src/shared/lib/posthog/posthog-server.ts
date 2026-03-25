import { PostHog } from 'posthog-node';
import { after } from 'next/server';
import { logger } from './logger';

function getClient() {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
}

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
) {
  try {
    const client = getClient();
    client.capture({ distinctId, event, properties });
    after(async () => {
      try {
        await client.flushAsync();
      } catch {
        // ignore — non-blocking
      }
    });
  } catch {
    // non-blocking — never break request flow
  }
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

  try {
    const client = getClient();
    client.capture({
      distinctId: context.userId ?? 'server',
      event: 'server_error',
      properties: {
        service: context.service,
        action: context.action,
        error: errorMessage,
        ...context.extra,
      },
    });
    after(async () => {
      try {
        await client.flushAsync();
      } catch {
        // ignore — non-blocking
      }
    });
  } catch {
    // non-blocking
  }
}
