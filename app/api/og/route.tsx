import { client as sanityClient } from '@/shared/sanity/lib/client';
import { urlFor } from '@/shared/sanity/lib/image';
import { OG_IMAGE_QUERY, SITE_LOGO_QUERY } from '@/shared/sanity/lib/query';
import { isLocalizedString } from '@/shared/sanity/utils/checkLocaliztionType';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    notFound();
  }

  const [data, logoData] = await Promise.all([
    sanityClient.fetch(OG_IMAGE_QUERY, { id }),
    sanityClient.fetch(SITE_LOGO_QUERY),
  ]);

  if (!data) {
    notFound();
  }

  const vibrantBackground =
    data?.image?.metadata?.palette?.vibrant?.background ?? '#3B82F6';
  const darkVibrantBackground =
    data?.image?.metadata?.palette?.darkVibrant?.background ?? '#3B82F6';

  const text = isLocalizedString(data.title)
    ? (data.title as any).en
    : data.title;

  const logoUrl = logoData?.logo?.url ? urlFor(logoData.logo.url).width(150).height(150).url() : null;

  return new ImageResponse(
    <div
      tw="flex w-full h-full relative"
      style={{
        background: `linear-gradient(135deg, ${vibrantBackground} 0%, ${darkVibrantBackground} 100%)`,
      }}
    >
      {/* Logo in top right corner */}
      {logoUrl && (
        <div tw="absolute top-8 right-8 flex items-center justify-center bg-white rounded-full p-4 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="Logo"
            tw="w-20 h-20"
            style={{
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      {/* Content container */}
      <div tw="flex flex-row w-full h-full relative">
        {/* Text content */}
        <div tw="flex-1 flex items-center px-10">
          <h1 tw="text-7xl tracking-tight leading-none text-white leading-tight">
            {text}
          </h1>
        </div>

        {/* Image container */}
        {data.image && (
          <div tw="flex w-[500px] h-[630px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlFor(data.image.url!).width(500).height(630).url()}
              alt=""
              tw="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: await loadGoogleFont('Inter', text ?? ''),
          weight: 400,
          style: 'normal',
        },
      ],
    },
  );
}
