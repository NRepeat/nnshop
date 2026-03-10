import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import { urlFor } from '@/shared/sanity/lib/image';
import { HOME_PAGEResult } from '@/shared/sanity/types';
import { Button } from '@/shared/ui/button';
import { stegaClean } from 'next-sanity';
import { resolveCollectionLink } from '@shared/lib/shopify/resolve-shopify-link';
import { getLocalizedString } from '@shared/sanity/utils/getLocalizedString';

type SplitGridProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'splitImage' }
> & { locale: string; gender?: string };

function hexToRgba(hex: string, opacity: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function getPositionStyle(position: string): React.CSSProperties {
  const [vertical, horizontal] = position.split('-');
  const style: React.CSSProperties = {};

  if (vertical === 'top') style.top = 'clamp(1rem, 3vw, 2rem)';
  else if (vertical === 'middle') style.top = '50%';
  else style.bottom = 'clamp(1rem, 3vw, 2rem)';

  if (horizontal === 'left') style.left = 'clamp(1rem, 3vw, 2rem)';
  else if (horizontal === 'center') style.left = '50%';
  else style.right = 'clamp(1rem, 3vw, 2rem)';

  const tx = horizontal === 'center' ? '-50%' : '0';
  const ty = vertical === 'middle' ? '-50%' : '0';
  if (tx !== '0' || ty !== '0') style.transform = `translate(${tx}, ${ty})`;

  return style;
}

function getTextAlign(position: string): React.CSSProperties {
  const horizontal = position.split('-')[1];
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

export function SplitImage(props: SplitGridProps) {
  const { title, image, orientation, collection, locale, gender } = props;
  const description = (props as any).description;
  const textPosition: string =
    stegaClean((props as any).textPosition) || 'bottom-left';
  const titleColor: string | null = (props as any).titleColor?.hex ?? null;
  const descriptionColor: string | null =
    (props as any).descriptionColor?.hex ?? null;
  const overlay = (props as any).overlay;
  const textBackground = (props as any).textBackground;

  const overlayColor = overlay?.color?.hex
    ? hexToRgba(overlay.color.hex, (overlay.opacity ?? 30) / 100)
    : 'rgba(0,0,0,0.3)';

  const textBgColor = textBackground?.color?.hex
    ? hexToRgba(textBackground.color.hex, (textBackground.opacity ?? 40) / 100)
    : undefined;
  const textPad =
    textBackground?.padding === 'sm'
      ? '0.75rem'
      : textBackground?.padding === 'lg'
        ? '1.5rem'
        : '1rem';

  const localizedDescription = description
    ? (description[locale as 'uk' | 'ru'] ?? description.uk ?? null)
    : null;
  const localizedTitle =
    getLocalizedString(title as any, locale) ??
    (typeof title === 'string' ? title : null);
  const linkUrl =
    collection && collection?.id
      ? resolveCollectionLink(collection, locale, gender)
      : null;

  const ImageComponent = image ? (
    <div className="group relative w-full overflow-hidden rounded bg-gray-100 aspect-[4/5]">
      <Image
        className="transition-transform object-cover duration-700 ease-in-out group-hover:scale-105"
        src={urlFor(image).auto('format').quality(80).url()}
        fill
        alt={localizedTitle || ''}
        priority
      />
      <div className="pointer-events-none absolute inset-0 rounded inset-shadow-sm " />
    </div>
  ) : null;

  return (
    <section className="container group">
      <div className="py-8 md:py-8">
        <Link
          href={linkUrl && linkUrl.handle ? linkUrl.handle : ''}
          className="block h-full w-full group"
          prefetch
        >
          <div
            className={`w-full flex flex-col gap-8 md:flex-row md:items-center ${stegaClean(orientation) === 'imageRight' ? 'md:flex-row-reverse' : ''}`}
          >
            {/* Image block with mobile overlay */}
            <div className="relative aspect-square w-full overflow-hidden md:flex-1">
              {ImageComponent}

              {/* Mobile: text overlaid with configurable position */}
              <div
                className="rounded absolute inset-0 md:hidden"
                style={{ backgroundColor: overlayColor }}
              >
                <div
                  className="absolute max-w-[85%] flex flex-col gap-3"
                  style={{
                    ...getPositionStyle(textPosition),
                    ...getTextAlign(textPosition),
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      ...(textBgColor && {
                        backgroundColor: textBgColor,
                        padding: textPad,
                        borderRadius: textBackground?.rounded
                          ? '0.375rem'
                          : undefined,
                      }),
                    }}
                  >
                    {localizedTitle && (
                      <h2
                        className="text-pretty font-light leading-tight tracking-tight text-3xl sm:text-4xl"
                        style={{ color: titleColor ?? '#ffffff' }}
                      >
                        {localizedTitle}
                      </h2>
                    )}
                    {(localizedDescription || linkUrl?.handle) && (
                      <span
                        className="text-base uppercase tracking-widest"
                        style={{
                          color: descriptionColor ?? 'rgba(255,255,255,0.85)',
                        }}
                      >
                        {localizedDescription}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: separate text column, aligned by textPosition horizontal */}
            <div
              className={`hidden w-full md:flex md:flex-1 ${stegaClean(orientation) === 'imageRight' ? 'md:pr-12' : 'md:pl-12'}`}
            >
              <div
                className="flex flex-col gap-6 w-full text-black"
                style={getTextAlign(textPosition)}
              >
                {localizedTitle && (
                  <h2 className="text-pretty font-light leading-tight tracking-tight text-3xl md:text-4xl lg:text-5xl">
                    {localizedTitle}
                  </h2>
                )}
                {linkUrl?.handle && (
                  <Button
                    variant="link"
                    className="h-auto p-0 text-base uppercase text-wrap tracking-widest group-hover:underline duration-300 decoration-transparent group-hover:decoration-primary transition-all group-hover:opacity-70 text-black border-black rounded"
                  >
                    <span className="max-w-full text-pretty">
                      {localizedDescription}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
