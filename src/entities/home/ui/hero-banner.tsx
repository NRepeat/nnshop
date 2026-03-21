'use client';

import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@shared/ui/button';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@shared/ui/carousel';
import { urlFor } from '@shared/sanity/lib/image';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { useCallback, useEffect, useRef, useState } from 'react';

type HeroSliderBase = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'heroSlider' }
>;

type HeroSliderProps = HeroSliderBase & {
  gender?: string;
  videoFile?: string | null;
  videoFileWebm?: string | null;
  videoPoster?: string | null;
  videoUrl?: string | null;
  videoTitle?: string | null;
  videoDescription?: string | null;
  videoTextPosition?: string | null;
  videoTitleColor?: string | null;
  videoDescriptionColor?: string | null;
  videoLinkUrl?: string | null;
  videoCollection?: { handle?: string | null } | null;
  videoOverlay?: {
    color?: { hex?: string | null } | null;
    opacity?: number | null;
  } | null;
  compact?: boolean;
  isFirst?: boolean;
};

type Slide = NonNullable<HeroSliderBase['slides']>[number] & {
  title?: string | null;
  textPosition?: string | null;
  titleColor?: string | null;
  descriptionColor?: string | null;
  overlay?: {
    color?: { hex?: string | null } | null;
    opacity?: number | null;
  } | null;
  textBackground?: {
    color?: { hex?: string | null } | null;
    opacity?: number | null;
    padding?: 'sm' | 'md' | 'lg' | null;
    rounded?: boolean | null;
  } | null;
};

function sanitizeString(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/[^\x20-\x7E\u00A0-\u00FF\u0400-\u04FF]/g, '').trim();
}

function getPositionStyle(position: string): React.CSSProperties {
  const cleanPos = sanitizeString(position || 'bottom-left');
  const [vertical, horizontal] = cleanPos.split('-');

  const style: React.CSSProperties = {};

  if (vertical === 'top') {
    style.top = 'clamp(2rem, 5vw, 4rem)';
  } else if (vertical === 'middle') {
    style.top = '50%';
  } else {
    style.bottom = 'clamp(2rem, 5vw, 4rem)';
  }

  if (horizontal === 'left') {
    style.left = 'clamp(1.5rem, 4vw, 4rem)';
  } else if (horizontal === 'center') {
    style.left = '50%';
  } else {
    style.right = 'clamp(1.5rem, 4vw, 4rem)';
  }

  const translateX = horizontal === 'center' ? '-50%' : '0';
  const translateY = vertical === 'middle' ? '-50%' : '0';
  if (translateX !== '0' || translateY !== '0') {
    style.transform = `translate(${translateX}, ${translateY})`;
  }

  return style;
}

function getTextAlign(position: string): React.CSSProperties {
  const cleanPos = sanitizeString(position || 'bottom-left');
  const horizontal = cleanPos.split('-')[1];
  return {
    textAlign:
      horizontal === 'center'
        ? 'center'
        : horizontal === 'right'
          ? 'right'
          : 'left',
    alignItems:
      horizontal === 'center'
        ? 'center'
        : horizontal === 'right'
          ? 'flex-end'
          : 'flex-start',
  };
}

function hexToRgba(hex: string, opacity: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function buildOverlayBg(
  color?: { hex?: string | null } | null,
  opacity?: number | null,
) {
  const hex = color?.hex;
  const alpha = (opacity ?? 20) / 100;
  return hex ? hexToRgba(hex, alpha) : 'rgba(0, 0, 0, 0.2)';
}

// Video Hero

const getProxiedVideoUrl = (originalUrl: string | null | undefined) => {
  if (!originalUrl) return '';
  return originalUrl
};
type VideoHeroProps = {
  src: string;
  srcWebm?: string | null;
  poster?: string | null;
  textPosition: string;
  titleColor?: string | null;
  descriptionColor?: string | null;
  title?: string | null;
  description?: string | null;
  overlay?: {
    color?: { hex?: string | null } | null;
    opacity?: number | null;
  } | null;
  href?: string | null;
  compact?: boolean;
  isFirst?: boolean;
};

function VideoHero({
  src,
  srcWebm,
  poster,
  textPosition,
  titleColor,
  descriptionColor,
  title,
  description,
  overlay,
  href,
  compact,
  isFirst,
}: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const proxiedSrc = getProxiedVideoUrl(src);
  const proxiedSrcWebm = getProxiedVideoUrl(srcWebm);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    el.play().catch(() => {});
  }, []);

  const pos = textPosition;
  const overlayBg = buildOverlayBg(overlay?.color, overlay?.opacity);
  const Tag = isFirst ? 'h1' : 'h2';
  const inner = (
    <>
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover max-h-[75vh]"
        />
      )}
      <video
        ref={videoRef}
        poster={poster ?? undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover max-h-[75vh]"
      >
        {proxiedSrcWebm && <source src={proxiedSrcWebm} type="video/webm" />}
        <source src={proxiedSrc} type="video/mp4" />
      </video>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: overlayBg }}
      />
      {(title || description) && (
        <div
          className="absolute z-10 max-w-[80%] flex flex-col gap-4"
          style={{ ...getPositionStyle(pos), ...getTextAlign(pos) }}
        >
          {title && (
            <Tag
              className="text-3xl md:text-5xl font-bold tracking-tight drop-shadow-lg"
              style={{ color: titleColor ?? '#ffffff' }}
            >
              {title}
            </Tag>
          )}
          {description && (
            <p
              className="text-base md:text-lg drop-shadow leading-snug"
              style={{ color: descriptionColor ?? 'rgba(255,255,255,0.9)' }}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </>
  );

  const heightStyle = compact
    ? `.video-hero{height:40svh}`
    : `.video-hero{height:calc(70svh - var(--header-height,70px))}@media(min-width:768px){.video-hero{height:calc(85svh - var(--header-height,70px))}}`;

  return (
    <>
      <style>{heightStyle}</style>
      <div className="video-hero relative w-full overflow-hidden">
        {href ? (
          <Link href={href} className="absolute inset-0 z-10" prefetch>
            {inner}
          </Link>
        ) : (
          inner
        )}
      </div>
    </>
  );
}

// Image Slider

function ImageSlider({
  slides,
  gender,
  compact,
  isFirst,
}: {
  slides: Slide[];
  gender?: string;
  compact?: boolean;
  isFirst?: boolean;
}) {
  const resolveHref = (
    url?: string | null,
    collection?: { handle?: string | null } | null,
  ) => {
    if (url) return sanitizeString(url);
    if (collection?.handle) {
      const cleanHandle = sanitizeString(collection.handle);
      return gender ? `/${gender}/${cleanHandle}` : `/${cleanHandle}`;
    }
    return null;
  };

  const getSlideHref = (slide: Slide) =>
    resolveHref(slide.link?.url, slide.collection) ?? '/';

  const renderOverlayTitle = (slide: Slide, index: number) => {
    const Tag = isFirst && index === 0 ? 'h1' : 'h2';
    return (
      <Tag
        className="text-3xl md:text-5xl lg:text-8xl font-bold tracking-tight drop-shadow-lg"
        style={{ color: slide.titleColor ?? '#ffffff' }}
      >
        {slide.title}
      </Tag>
    );
  };

  const renderImages = (slide: Slide, index: number) => (
    <>
      {slide.mobileImage?.asset && (
        <div
          className="relative w-full block md:hidden"
          style={{
            height: compact
              ? '40svh'
              : 'calc(80svh - var(--header-height, 70px))',
          }}
        >
          <Image
            src={urlFor(slide.mobileImage.asset)
              .auto('format')
              .quality(80)
              .url()}
            alt={slide.title || slide.description || 'Banner mobile'}
            fill
            priority={index === 0}
            className="object-cover"
          />
        </div>
      )}
      {slide.image?.asset && (
        <div
          className={`relative w-full aspect-video ${slide.mobileImage?.asset ? 'hidden md:block' : 'block'}`}
          style={{
            maxHeight: compact
              ? '40svh'
              : 'calc(90svh - var(--header-height, 70px))',
          }}
        >
          <Image
            src={urlFor(slide.image.asset).auto('format').quality(80).url()}
            alt={slide.title || slide.description || 'Banner desktop'}
            fill={!compact}
            width={compact ? 1920 : undefined}
            height={compact ? 540 : undefined}
            priority={index === 0}
            className={compact ? 'w-full h-full object-cover' : 'object-cover'}
          />
        </div>
      )}
    </>
  );

  const renderOverlay = (slide: Slide, hasButtons: boolean, index: number) => {
    const pos = slide.textPosition ?? 'bottom-left';
    const overlayBg = buildOverlayBg(
      slide.overlay?.color,
      slide.overlay?.opacity,
    );

    const tb = slide.textBackground;
    const textBgColor = tb?.color?.hex
      ? hexToRgba(tb.color.hex, (tb.opacity ?? 40) / 100)
      : undefined;
    const textPad =
      tb?.padding === 'sm'
        ? '0.75rem'
        : tb?.padding === 'lg'
          ? '1.5rem'
          : '1rem';

    return (
      <>
        <div
          className="absolute inset-0 transition-colors"
          style={{ backgroundColor: overlayBg }}
        />
        <div
          className="absolute z-10 max-w-[80%] flex flex-col gap-4"
          style={{ ...getPositionStyle(pos), ...getTextAlign(pos) }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              ...(textBgColor && {
                backgroundColor: textBgColor,
                padding: textPad,
                borderRadius: tb?.rounded ? '0.375rem' : undefined,
              }),
            }}
          >
            {slide.title && renderOverlayTitle(slide, index ?? 1)}
            {slide.description && (
              <p
                className="text-2xl md:text-3xl lg:text-5xl drop-shadow leading-snug"
                style={{
                  color: slide.descriptionColor ?? 'rgba(255,255,255,0.9)',
                }}
              >
                {slide.description}
              </p>
            )}
            {hasButtons && slide.buttons && slide.buttons.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {slide.buttons.map((btn, btnIndex) => (
                  <Button
                    key={`${btn.label}-${btnIndex}`}
                    variant={btn.variant ?? 'secondary'}
                    className="min-w-[140px] h-11 md:h-13 text-sm uppercase tracking-widest rounded"
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const [api2, setApi2] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onInit = useCallback((api: CarouselApi) => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
  }, []);

  const onSelect = useCallback(
    (api: CarouselApi) => {
      if (!api) return;
      if (api2 && api === api2) setSelectedIndex(api2.selectedScrollSnap());
    },
    [api2],
  );

  const initTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (api2) {
      api2.on('select', onSelect);
      api2.on('reInit', onSelect);
      initTimerRef.current = setTimeout(() => onInit(api2), 0);
    }
    return () => {
      if (initTimerRef.current) clearTimeout(initTimerRef.current);
      if (api2) {
        api2.off('select', onSelect);
        api2.off('reInit', onSelect);
      }
    };
  }, [api2, onSelect, onInit]);

  return (
    <Carousel
      opts={{ loop: true, active: true }}
      setApi={setApi2}
      plugins={[Autoplay({ delay: 8000, stopOnInteraction: false })]}
    >
      <CarouselContent className="ml-0">
        {slides.map((slide, index) => {
          const hasButtons = !!slide.buttons?.length;
          return (
            <CarouselItem key={index} className="pl-0 relative w-full">
              <Link
                prefetch
                href={getSlideHref(slide)}
                className="group relative flex w-full h-full justify-center"
              >
                {renderImages(slide, index)}
                {renderOverlay(slide, hasButtons, index)}
              </Link>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        {scrollSnaps.map((_, index) => (
          <Button
            key={index}
            aria-label={`Slide ${index + 1}`}
            className={`w-2 h-[3px] py-0 px-3 ${
              index === selectedIndex ? 'bg-primary' : 'bg-gray-300'
            }`}
            onClick={() => api2?.scrollTo(index)}
          />
        ))}
      </div>
    </Carousel>
  );
}

// HeroBanner

export const HeroBanner = (props: HeroSliderProps) => {
  const {
    slides,
    gender,
    videoFile,
    videoFileWebm,
    videoPoster,
    videoUrl,
    compact,
    isFirst,
  } = props;
  const hasVideo = !!(videoFile || videoUrl);

  if (!hasVideo && (!slides || slides.length === 0)) return null;

  return (
    <div className="hero-banner relative w-full overflow-hidden">
      {hasVideo ? (
        <VideoHero
          src={props.videoFile || props.videoUrl || ''}
          srcWebm={videoFileWebm}
          poster={videoPoster}
          textPosition={props.videoTextPosition ?? 'bottom-left'}
          titleColor={props.videoTitleColor}
          descriptionColor={props.videoDescriptionColor}
          title={props.videoTitle}
          description={props.videoDescription}
          overlay={props.videoOverlay}
          compact={compact}
          isFirst={isFirst}
          href={
            props.videoLinkUrl
              ? sanitizeString(props.videoLinkUrl)
              : props.videoCollection?.handle
                ? `/${gender ?? ''}/${sanitizeString(props.videoCollection.handle)}`.replace(
                    '//',
                    '/',
                  )
                : null
          }
        />
      ) : (
        <ImageSlider
          slides={slides as Slide[]}
          gender={gender}
          compact={compact}
          isFirst={isFirst}
        />
      )}
    </div>
  );
};
