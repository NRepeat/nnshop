const apiLogin = process.env.ESPUTNIK_API_LOGIN;
const apiKey = process.env.ESPUTNIK_API_KEY;

if (!apiLogin || !apiKey) {
  console.warn(
    'ESPUTNIK_API_LOGIN and ESPUTNIK_API_KEY not set — email sending will fail',
  );
}

export const ESPUTNIK_CONFIG = {
  baseUrl: 'https://esputnik.com/api/v1',
  authHeader: `Basic ${Buffer.from(`${apiLogin}:${apiKey}`).toString('base64')}`,
};

export async function sendEvent({
  eventTypeKey,
  keyValue,
  params,
  forceUpdate = false,
}: {
  eventTypeKey: string;
  keyValue: string;
  params: Record<string, string>;
  forceUpdate?: boolean;
}) {
  const response = await fetch(`${ESPUTNIK_CONFIG.baseUrl}/event`, {
    method: 'POST',
    headers: {
      Authorization: ESPUTNIK_CONFIG.authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventTypeKey,
      keyValue,
      forceUpdate,
      params: Object.entries(params).map(([name, value]) => ({
        name,
        value,
      })),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`eSputnik event failed (${response.status}): ${text}`);
  }

  return response;
}
