import { PAGE_QUERYResult } from '@/shared/sanity/types';
import { getLocalizedString } from '@shared/sanity/utils/getLocalizedString';
import { urlFor } from '@shared/sanity/lib/image';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import Image from 'next/image';

type FAQsProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>['content']>[number],
  { _type: 'faqs' }
> & { locale?: string };

export function FAQs({ title, subtitle, items, locale = 'uk' }: FAQsProps) {
  const localizedTitle = getLocalizedString(title, locale);
  const localizedSubtitle = getLocalizedString(subtitle, locale);

  return (
    <section className="w-full bg-muted/40 py-10 md:py-10">
      <div className="container mx-auto flex flex-col items-center gap-8">
        {localizedTitle && (
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-center text-foreground max-w-3xl">
            {localizedTitle}
          </h2>
        )}
        {localizedSubtitle && (
          <p className="text-sm md:text-base text-muted-foreground text-center max-w-2xl leading-relaxed">
            {localizedSubtitle}
          </p>
        )}
        {Array.isArray(items) && items.length > 0 && (
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-4">
            {items.map((item) => {
              const label = getLocalizedString(item.label, locale);
              const iconUrl = item.icon ? urlFor(item.icon as SanityImageSource).width(100).height(100).url() : null;
              return (
                <div
                  key={item._key}
                  className="flex flex-col items-center gap-3 max-w-[160px] text-center"
                >
                  {iconUrl ? (
                    <Image
                      src={iconUrl}
                      alt={label || ''}
                      width={100}
                      height={100}
                      className="w-20 h-20 object-contain"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted" />
                  )}
                  {label && (
                    <p className="text-sm text-foreground leading-snug">{label}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
