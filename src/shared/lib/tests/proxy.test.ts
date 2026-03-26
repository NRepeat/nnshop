import { describe, it, expect, vi } from 'vitest';
import { proxy } from '../../../../proxy';
import { NextRequest, NextResponse } from 'next/server';

// Mock the dependencies
vi.mock('@shared/i18n/routing', () => ({
  routing: {
    locales: ['uk', 'ru'],
    defaultLocale: 'uk',
    localeDetection: false,
  },
}));

vi.mock('@shared/lib/utils/cleanSlug', () => ({
  cleanSlug: (slug: string) => slug.replace(/\/+$/, '') || '/',
}));

vi.mock('@entities/collection/lib/resolve-handle', () => ({
  hasGenderedSuffix: (slug: string) => slug.includes('-for-'),
}));

// Mock createMiddleware from next-intl
vi.mock('next-intl/middleware', () => ({
  default: () => () => NextResponse.next(),
}));

describe('proxy.ts redirect logic', () => {
  const createRequest = (urlStr: string, headers: Record<string, string> = {}) => {
    const url = new URL(urlStr);
    const req = new NextRequest(url, { headers });
    // In some environments, host header is not automatically set from the URL
    if (!req.headers.has('host')) {
      req.headers.set('host', url.host);
    }
    return req;
  };

  const getRedirectUrl = (res: NextResponse) => {
    return res.headers.get('location');
  };

  const getStatus = (res: NextResponse) => {
    return res.status;
  };

  it('redirects http://miomio.com.ua/ to https://www.miomio.com.ua/uk/woman (301)', async () => {
    const req = createRequest('http://miomio.com.ua/');
    const res = await proxy(req);
    expect(getStatus(res)).toBe(301);
    expect(getRedirectUrl(res)).toBe('https://www.miomio.com.ua/uk/woman');
  });

  it('redirects https://miomio.com.ua/uk to https://www.miomio.com.ua/uk/woman (301)', async () => {
    const req = createRequest('https://miomio.com.ua/uk');
    const res = await proxy(req);
    expect(getStatus(res)).toBe(301);
    expect(getRedirectUrl(res)).toBe('https://www.miomio.com.ua/uk/woman');
  });

  it('redirects https://www.miomio.com.ua/ru/ to https://www.miomio.com.ua/ru/woman (301)', async () => {
    const req = createRequest('https://www.miomio.com.ua/ru/');
    const res = await proxy(req);
    expect(getStatus(res)).toBe(301);
    expect(getRedirectUrl(res)).toBe('https://www.miomio.com.ua/ru/woman');
  });

  it('redirects https://www.miomio.com.ua/ru to https://www.miomio.com.ua/ru/woman (301)', async () => {
    const req = createRequest('https://www.miomio.com.ua/ru');
    const res = await proxy(req);
    expect(getStatus(res)).toBe(301);
    // Current implementation: /ru -> /uk/woman (BUG!)
    // Target implementation: /ru -> /ru/woman
    expect(getRedirectUrl(res)).toBe('https://www.miomio.com.ua/ru/woman');
  });

  it('redirects https://www.miomio.com.ua/some-path/ to https://www.miomio.com.ua/uk/some-path (301)', async () => {
    const req = createRequest('https://www.miomio.com.ua/some-path/');
    const res = await proxy(req);
    expect(getStatus(res)).toBe(301);
    expect(getRedirectUrl(res)).toBe('https://www.miomio.com.ua/uk/some-path');
  });

  it('redirects https://www.miomio.com.ua/ru/productt/slug to https://www.miomio.com.ua/ru/product/slug (301)', async () => {
    const req = createRequest('https://www.miomio.com.ua/ru/productt/slug');
    const res = await proxy(req);
    expect(getStatus(res)).toBe(301);
    expect(getRedirectUrl(res)).toBe('https://www.miomio.com.ua/ru/product/slug');
  });

  it('redirects http non-www with trailing slash to canonical in one hop', async () => {
    const req = createRequest('http://miomio.com.ua/uk/');
    const res = await proxy(req);
    expect(getStatus(res)).toBe(301);
    expect(getRedirectUrl(res)).toBe('https://www.miomio.com.ua/uk/woman');
  });

  it('redirects /ru/ with trailing slash to /ru/woman in one hop', async () => {
      const req = createRequest('https://www.miomio.com.ua/ru/');
      const res = await proxy(req);
      expect(getStatus(res)).toBe(301);
      expect(getRedirectUrl(res)).toBe('https://www.miomio.com.ua/ru/woman');
  });

  it('handles multiple normalization steps in one hop', async () => {
    // http -> https, non-www -> www, trailing slash -> none, typo fix
    const req = createRequest('http://miomio.com.ua/ru/productt/slug/');
    const res = await proxy(req);
    expect(getStatus(res)).toBe(301);
    expect(getRedirectUrl(res)).toBe('https://www.miomio.com.ua/ru/product/slug');
  });

  it('normalizes search query parameter q to lowercase', async () => {
    const req = createRequest('https://www.miomio.com.ua/uk/search?q=Shoes');
    const res = await proxy(req);
    expect(getStatus(res)).toBe(301);
    expect(getRedirectUrl(res)).toBe('https://www.miomio.com.ua/uk/search?q=shoes');
  });
});
