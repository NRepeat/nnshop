import { createHmac } from 'crypto';
import { type NextRequest, NextResponse } from 'next/server';

const VERCEL_LOG_DRAIN_SECRET = process.env.VERCEL_LOG_DRAIN_SECRET;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

type VercelLogEntry = {
  id?: string;
  message?: string;
  timestamp?: number;
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  source?: 'build' | 'edge' | 'lambda' | 'static' | 'external';
  statusCode?: number;
  path?: string;
  host?: string;
  deploymentId?: string;
  projectId?: string;
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verify Vercel signature
  const signature = req.headers.get('x-vercel-signature');
  if (!VERCEL_LOG_DRAIN_SECRET || !signature) {
    return new Response('Unauthorized', { status: 401 });
  }

  const expected = createHmac('sha1', VERCEL_LOG_DRAIN_SECRET)
    .update(rawBody)
    .digest('hex');

  if (signature !== expected) {
    return new Response('Invalid signature', { status: 401 });
  }

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('[vercel-alert] Telegram env vars not set');
    return new Response('Server misconfigured', { status: 500 });
  }

  // Vercel sends NDJSON (newline-delimited JSON)
  const entries: VercelLogEntry[] = rawBody
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  // Only alert on errors/fatals or 5xx responses
  const critical = entries.filter(
    (e) =>
      e.level === 'error' ||
      e.level === 'fatal' ||
      (e.statusCode && e.statusCode >= 500),
  );

  if (critical.length === 0) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  for (const entry of critical) {
    const message = formatMessage(entry);
    await sendTelegram(message);
  }

  return NextResponse.json({ ok: true, sent: critical.length });
}

function formatMessage(entry: VercelLogEntry): string {
  const level = entry.level?.toUpperCase() ?? 'ERROR';
  const emoji = entry.level === 'fatal' ? '🔴' : '🟠';
  const time = entry.timestamp
    ? new Date(entry.timestamp).toISOString()
    : new Date().toISOString();

  let text = `${emoji} <b>Vercel ${level}</b>\n\n`;
  if (entry.message) text += `<b>Message:</b> ${entry.message}\n`;
  if (entry.path) text += `<b>Path:</b> ${entry.path}\n`;
  if (entry.statusCode) text += `<b>Status:</b> ${entry.statusCode}\n`;
  if (entry.source) text += `<b>Source:</b> ${entry.source}\n`;
  if (entry.deploymentId) text += `<b>Deployment:</b> ${entry.deploymentId}\n`;
  text += `<b>Time:</b> ${time}`;

  return text;
}

async function sendTelegram(message: string): Promise<void> {
  const res = await fetch(
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

  if (!res.ok) {
    console.error('[vercel-alert] Telegram error:', await res.text());
  }
}
