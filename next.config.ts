import { fetchRedirects } from '@/shared/sanity/lib/fetchRedirects';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },

  // logging: {
  //   fetches: {
  //     fullUrl: false,
  //   },
  // },
  cacheComponents: true,
  allowedDevOrigins: [
    'development.nninc.uk',
    'http://localhost:3000',
    'http://localhost:4000',
    'http://localhost:3333',
    'prod.nninc.uk',
    'miomio.com.ua',
    'www.miomio.com.ua',
    'nmactunel.nninc.uk',
    'https://www.miomio.com.ua',
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    const redirectsData = await fetchRedirects();
    return redirectsData
      .filter(
        (redirect) =>
          redirect.source &&
          redirect.destination &&
          redirect.permanent !== null,
      )
      .map((redirect) => ({
        source: redirect.source!,
        destination: redirect.destination!,
        permanent: redirect.permanent!,
      }));
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/array/:path*',
        destination: 'https://us-assets.i.posthog.com/array/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};
const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');
export default withNextIntl(nextConfig);
