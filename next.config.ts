import { fetchRedirects } from '@/shared/sanity/lib/fetchRedirects';
import { withPostHogConfig } from '@posthog/nextjs-config';
import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withBotId } from 'botid/next/config';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  analyzerMode: 'static',
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
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
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
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

export default withBotId(withBundleAnalyzer(withPostHogConfig(withNextIntl(nextConfig), {
  personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY!,
  projectId: process.env.POSTHOG_PROJECT_ID!,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  sourcemaps: {
    enabled: process.env.NODE_ENV === 'production',
    deleteAfterUpload: true,
  },
})));
