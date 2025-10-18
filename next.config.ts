import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'dev.nninc.uk',
    'http://localhost:3000',
    'http://localhost:3333',
  ],
  images: {
    unoptimized: true,
    domains: ['cdn.shopify.com'],
    remotePatterns: [new URL('https://cdn.shopify.com')],
  },
};

export default nextConfig;
