'use client';

import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import { urlFor } from '@shared/sanity/lib/image';
import { resolveCollectionLink } from '@shared/lib/shopify/resolve-shopify-link';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

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
    <section className="w-full grid grid-cols-1 md:grid-cols-2">
      {banners.map((banner) => (
        <BannerItem
          key={banner._key}
          banner={banner}
          locale={locale}
          gender={gender}
        />
      ))}
    </section>
  );
}

function BannerItem({
  banner,
  locale,
  gender,
}: {
  banner: any;
  locale: string;
  gender?: string;
}) {
  const containerRef = useRef<HTMLAnchorElement>(null);
  
  const title = typeof banner.title === 'string' ? banner.title : null;
  const linkData = banner.collection
    ? resolveCollectionLink(banner.collection as any, locale, gender)
    : null;
  const href = banner.customUrl ?? linkData?.handle ?? '#';
  const imageUrl = banner.image?.asset
    ? urlFor(banner.image).auto('format').quality(100).url()
    : null;
  const hotspotX = banner.image?.hotspot?.x ?? 0.5;
  const hotspotY = banner.image?.hotspot?.y ?? 0.5;
  const objectPosition = `${hotspotX * 100}% ${hotspotY * 100}%`;
  const altText =
    typeof banner.image?.alt === 'string'
      ? banner.image.alt
      : (title ?? '');

  // Используем расширенный offset, чтобы отследить весь путь баннера через экран
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  /**
   * Логика движения:
   * 0.0 - верх баннера появился снизу экрана
   * 0.5 - баннер в центре экрана
   * 1.0 - низ баннера ушел за верх экрана
   * 
   * Мы настраиваем диапазон так, чтобы текст дольше оставался "внизу" вьюпорта.
   */
  const top = useTransform(
    scrollYProgress, 
    [0.4, 0.8], // Текст начинает движение, когда баннер прошел середину, и заканчивает к верху
    ['50%', '92%'] 
  );
  
  const y = useTransform(scrollYProgress, [0.4, 0.8], ['-50%', '0%']);
  const opacity = useTransform(scrollYProgress, [0.85, 0.95], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.4, 0.8], [1, 0.95]);

  return (
    <Link
      ref={containerRef}
      href={href}
      prefetch
      className="group relative block overflow-hidden w-full aspect-3/4 bg-neutral-100"
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={altText}
          fill
          className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          style={{ objectPosition }}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      )}
      
      {/* Затемнение для читаемости */}
      <div className="pointer-events-none absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
      
      {title && (
        <motion.div
          style={{ top, y, opacity, scale }}
          className="absolute left-0 w-full px-6 md:px-10 text-center pointer-events-none z-10"
        >
          <h2 className="text-white font-light tracking-[0.2em] uppercase text-2xl md:text-4xl leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            {title}
          </h2>
        </motion.div>
      )}
    </Link>
  );
}
