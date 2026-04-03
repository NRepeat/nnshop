import { fetchRedirects } from '@/shared/sanity/lib/fetchRedirects';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  experimental: {
    // cpus: 2,
  },
  trailingSlash: false,
  output: 'standalone',
  productionBrowserSourceMaps: true,
  serverExternalPackages: [],
  typescript: {
    ignoreBuildErrors: false,
  },

  cacheComponents: true,
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://localhost:4000',
    'http://localhost:3333',
    'staging.miomio.com.ua',
    'prod.nninc.uk',
    'miomio.com.ua',
    'www.miomio.com.ua',
    'nmactunel.nninc.uk',
  ],
  images: {
    loader: 'custom',
    loaderFile: './lib/imageLoader.ts',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
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
      .map((redirect) => {
        let destination = redirect.destination!;

        // 1. Internal destination normalization (starts with /, not //)
        if (destination.startsWith('/') && !destination.startsWith('//')) {
          if (destination.length > 1 && destination.endsWith('/')) {
            destination = destination.slice(0, -1);
          }
        }

        // 2. Absolute URL normalization for our domain
        if (destination.includes('miomio.com.ua')) {
          try {
            const url = new URL(destination);
            if (
              url.hostname === 'miomio.com.ua' ||
              url.hostname === 'www.miomio.com.ua'
            ) {
              url.protocol = 'https:';
              url.hostname = 'www.miomio.com.ua';
              if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
                url.pathname = url.pathname.slice(0, -1);
              }
              destination = url.toString();
            }
          } catch {
            // Fallback to original if URL is malformed
          }
        }

        return {
          source: redirect.source!,
          destination: destination,
          permanent: redirect.permanent!,
        };
      });
  },
  async rewrites() {
    return [
      {
        source: '/assets/pulse/:path*',
        destination: 'https://cdn.pulse.is/:path*',
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
      {
        source: '/assets/pulse/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');

export default withNextIntl(nextConfig);
