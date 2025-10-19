import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'dev.nninc.uk',
    'close-dane-shining.ngrok-free.app',
    'http://localhost:3000',
    'http://localhost:3333',
  ],
  images: {
    unoptimized: true,
    domains: ['cdn.shopify.com'],
    remotePatterns: [
      new URL('https://cdn.shopify.com'),
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
