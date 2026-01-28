import { fetchRedirects } from '@/shared/sanity/lib/fetchRedirects';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },

  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  cacheComponents: true,
  allowedDevOrigins: [
    'dev.nninc.uk',
    'development.nninc.uk',
    'close-dane-shining.ngrok-free.app',
    'https://close-dane-shining.ngrok-free.app',
    'http://localhost:3000',
    'http://localhost:3333',
    'r665avfiaqptwlw27urowyzo5q.srv.us',
  ],
  images: {
    domains: ['cdn.shopify.com'],
    remotePatterns: [
      new URL('https://cdn.shopify.com'),
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
};
const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');
export default withNextIntl(nextConfig);
