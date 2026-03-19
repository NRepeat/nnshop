import { ImageResponse } from 'next/og';
import { sanityFetch } from '@/shared/sanity/lib/client';
import { SITE_LOGO_QUERY } from '@/shared/sanity/lib/query';
import { urlFor } from '@/shared/sanity/lib/image';

export const alt = 'Mio Mio';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Primary: oklch(21.64% 0.049 276.34) ≈ dark navy
const PRIMARY = '#1E1C2A';
// Destructive: oklch(0.577 0.245 27.325) ≈ red
const RED = '#D94020';
const WHITE = '#FFFFFF';

export default async function Image() {
  let logoUrl: string | null = null;
  try {
    const logoData = await sanityFetch({
      query: SITE_LOGO_QUERY,
      tags: ['siteSettings'],
    });
    logoUrl = logoData?.logo?.url ? urlFor(logoData.logo.url).width(120).height(120).url() : null;
  } catch {
    // fallback: render without logo
  }

  return new ImageResponse(
    (
      <div
        tw="flex w-full h-full"
        style={{ background: PRIMARY, fontFamily: 'sans-serif' }}
      >
        {/* Red accent bar — left edge */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '8px',
            height: '100%',
            background: RED,
          }}
        />

        {/* Main content */}
        <div
          tw="flex flex-col justify-center"
          style={{ paddingLeft: '80px', paddingRight: '80px', flex: 1 }}
        >
          {/* Brand name */}
          <div
            style={{
              fontSize: '100px',
              fontWeight: 700,
              color: WHITE,
              letterSpacing: '-2px',
              lineHeight: 1,
              marginBottom: '24px',
            }}
          >
            MIO MIO
          </div>

          {/* Red underline */}
          <div
            style={{
              width: '80px',
              height: '4px',
              background: RED,
              marginBottom: '28px',
            }}
          />

          {/* Tagline */}
          <div
            style={{
              fontSize: '28px',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 400,
              letterSpacing: '0.5px',
            }}
          >
            Інтернет-магазин взуття та аксесуарів
          </div>
        </div>

        {/* Logo watermark — bottom right */}
        {logoUrl && (
          <div
            style={{
              position: 'absolute',
              bottom: '36px',
              right: '48px',
              opacity: 0.9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Mio Mio"
              width={80}
              height={80}
              style={{ objectFit: 'contain' }}
            />
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
