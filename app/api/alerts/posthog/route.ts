import { type NextRequest, NextResponse } from 'next/server';

const WEBHOOK_SECRET = process.env.POSTHOG_WEBHOOK_SECRET;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(req: NextRequest) {
  // Verify secret token from header
  const secret = req.headers.get('x-webhook-secret');
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('[posthog-alert] Telegram env vars not set');
    return new Response('Server misconfigured', { status: 500 });
  }

  const message = formatMessage(body);

  const tgRes = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    },
  );

  if (!tgRes.ok) {
    const err = await tgRes.text();
    console.error('[posthog-alert] Telegram error:', err);
    return new Response('Failed to send Telegram message', { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function formatMessage(body: Record<string, unknown>): string {
  const name = body.name ?? body.event ?? 'Unknown error';
  const description = body.description ?? body.message ?? '';
  const url = body._posthogUrl ?? body.url ?? '';
  const time = new Date().toISOString();

  let text = `🚨 <b>PostHog Alert</b>\n\n`;
  text += `<b>Error:</b> ${name}\n`;
  if (description) text += `<b>Details:</b> ${description}\n`;
  if (url) text += `<b>Link:</b> ${url}\n`;
  text += `<b>Time:</b> ${time}`;

  return text;
}
