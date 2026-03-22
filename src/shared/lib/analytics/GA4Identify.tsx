'use client';

import { useEffect } from 'react';
import { saveGaClientId } from './saveGaClientId';

/**
 * Parses GA4 client_id from the _ga cookie.
 * Cookie format: GA1.1.XXXXXXXXXX.XXXXXXXXXX
 * client_id = last two parts: "XXXXXXXXXX.XXXXXXXXXX"
 */
function readGaClientId(): string | null {
  const match = document.cookie.match(/_ga=([^;]+)/);
  if (!match) return null;
  const parts = match[1].split('.');
  if (parts.length < 4) return null;
  return parts.slice(2).join('.');
}

/**
 * Reads the GA4 _ga cookie and persists the client_id to the User record.
 * Runs once per page load. Skips anonymous users (handled in server action).
 * This enables server-side GA4 Measurement Protocol events to be attributed
 * to the correct GA4 session/user even without browser context.
 */
export function GA4Identify() {
  useEffect(() => {
    const clientId = readGaClientId();
    if (!clientId) return;
    saveGaClientId(clientId).catch(() => {});
  }, []);

  return null;
}
