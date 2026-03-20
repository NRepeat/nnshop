// Base site URL (set NEXT_PUBLIC_SITE_URL in env for production)
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://miomio.com.ua';

export const TRUSTED_ORIGINS: string[] = [
  SITE_URL,
  'https://miomio.com.ua',
  'https://www.miomio.com.ua',
  'https://app.miomio.com.ua',
  'https://staging.miomio.com.ua',
  'https://nmactunel.nninc.uk',
  'https://prod.nninc.uk',
];

// Brand display name
export const BRAND_NAME = 'Mio Mio';

// Social media profile URLs
export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com/miomiocomua';
export const FACEBOOK_URL = process.env.NEXT_PUBLIC_FACEBOOK_URL ?? 'https://facebook.com/miomiocomua';
export const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_URL ?? 'https://t.me/miomio_com_ua';
export const TELEGRAM_CHANNEL_URL = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL ?? 'https://t.me/ItaliShoes';
