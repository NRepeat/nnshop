import { logger } from './logger';

export async function captureServerEvent(
  _distinctId: string,
  _event: string,
  _properties?: Record<string, unknown>,
) {
  // PostHog removed — no-op
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
}
