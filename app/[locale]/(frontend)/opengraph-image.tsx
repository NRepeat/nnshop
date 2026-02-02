import { ImageResponse } from 'next/og';
import { sanityFetch } from '@/shared/sanity/lib/client';
import { SITE_LOGO_QUERY } from '@/shared/sanity/lib/query';
import { urlFor } from '@/shared/sanity/lib/image';

export const runtime = 'edge';
export const alt = 'Mio Mio';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error('failed to load font data');
}

export default async function Image() {
  const logoData = await sanityFetch({
    query: SITE_LOGO_QUERY,
    revalidate: 3600, // Cache for 1 hour
  });

  const logoUrl = logoData?.logo?.url
    ? urlFor(logoData.logo.url).width(150).height(150).url()
    : null;

  const title = 'Mio Mio - Інтернет-магазин взуття та аксесуарів';
  const description =
    'Широкий вибір стильного взуття для чоловіків та жінок';

  return new ImageResponse(
    (
      <div
        tw="flex w-full h-full relative items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Logo in top right corner */}
        {logoUrl && (
          <div
            tw="absolute flex items-center justify-center bg-white rounded-full shadow-lg"
            style={{
              top: '32px',
              right: '32px',
              padding: '16px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Logo"
              width={80}
              height={80}
              style={{
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {/* Content */}
        <div tw="flex flex-col items-center justify-center px-16 text-center">
          <h1
            tw="text-8xl font-bold text-white mb-6"
            style={{
              textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            Mio Mio
          </h1>
          <p tw="text-3xl text-white opacity-90">{description}</p>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: await loadGoogleFont('Inter', title),
          weight: 700,
          style: 'normal',
        },
      ],
    },
  );
}
