import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import { urlFor } from '@shared/sanity/lib/image';
import { resolveCollectionLink } from '@shared/lib/shopify/resolve-shopify-link';
import { HOME_PAGEResult } from '@shared/sanity/types';

type CollectionBannerGridBlock = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'collectionBannerGrid' }
>;

type CollectionBannerGridProps = CollectionBannerGridBlock & {
  locale: string;
  gender?: string;
};

export function CollectionBannerGrid({
  banners,
  locale,
  gender,
}: CollectionBannerGridProps) {
  if (!banners?.length) return null;

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2 ">
      {banners.map((banner) => {
        const title = typeof banner.title === 'string' ? banner.title : null;
        const linkData = banner.collection
          ? resolveCollectionLink(banner.collection as any, locale, gender)
          : null;
        const href = banner.customUrl ?? linkData?.handle ?? '#';
        const imageUrl = banner.image?.asset
          ? urlFor(banner.image).auto('format').quality(85).url()
          : null;
        const hotspotX = banner.image?.hotspot?.x ?? 0.5;
        const hotspotY = banner.image?.hotspot?.y ?? 0.5;
        const objectPosition = `${hotspotX * 100}% ${hotspotY * 100}%`;
        const altText =
          typeof banner.image?.alt === 'string'
            ? banner.image.alt
            : (title ?? '');

        return (
          <Link
            key={banner._key}
            href={href}
            prefetch
            className="group relative block overflow-hidden max-h-[calc(100vh-200px)] w-full aspect-3/4"
          >
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={altText}
                fill
                className="object-cover transition-transform duration-700  ease-in-out group-hover:scale-105"
                style={{ objectPosition }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {title && (
              <div className="absolute bottom-10 left-0 p-6 md:p-10">
                <h2 className="text-white font-light tracking-[0.15em] uppercase text-2xl md:text-3xl leading-tight">
                  {title}
                </h2>
              </div>
            )}
          </Link>
        );
      })}
    </section>
  );
}
