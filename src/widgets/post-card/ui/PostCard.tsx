import {
  POSTS_QUERYResult,
  POSTS_BY_LANGUAGE_QUERYResult,
} from '@/shared/sanity/types';
import { urlFor } from '@/shared/sanity/lib/image';
import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import { Categories } from '@/entities/category';
import { PublishedAt } from '@/entities/published-at';
import { getContentLanguageInfo } from '@/shared/lib/locale';

type Variant = 'default' | 'featured';

export function PostCard(
  props: (POSTS_QUERYResult[0] | POSTS_BY_LANGUAGE_QUERYResult[0]) & {
    currentLocale?: string;
    variant?: Variant;
  },
) {
  const {
    title,
    mainImage,
    publishedAt,
    categories,
    language,
    currentLocale,
    variant = 'default',
  } = props;

  const languageInfo = getContentLanguageInfo(language, currentLocale || 'en');
  const postUrl = `/blog/${props.slug!.current}`;
  const isFeatured = variant === 'featured';

  return (
    <Link
      href={postUrl}
      className={
        isFeatured
          ? 'group block md:grid md:grid-cols-[1.1fr_1fr] md:gap-8 md:items-center'
          : 'group block'
      }
    >
      <div
        className={
          isFeatured
            ? 'relative aspect-[16/10] overflow-hidden rounded-lg bg-muted'
            : 'relative aspect-[4/3] overflow-hidden rounded-lg bg-muted mb-3'
        }
      >
        {mainImage ? (
          <Image
            src={urlFor(mainImage).width(isFeatured ? 1000 : 600).height(isFeatured ? 625 : 450).url()}
            fill
            sizes={
              isFeatured
                ? '(max-width: 768px) 100vw, 55vw'
                : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
            }
            alt={mainImage.alt || title || ''}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>

      <div className={isFeatured ? 'flex flex-col justify-center mt-4 md:mt-0' : ''}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Categories categories={categories} />
          {languageInfo.shouldShowIndicator && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
              {languageInfo.indicatorText}
            </span>
          )}
        </div>
        <h2
          className={
            isFeatured
              ? 'text-balance text-xl md:text-2xl lg:text-3xl font-semibold tracking-[-0.01em] leading-[1.15] text-foreground transition-colors group-hover:text-foreground/70'
              : 'text-balance text-base md:text-lg font-semibold tracking-[-0.005em] leading-[1.25] text-foreground transition-colors group-hover:text-foreground/70'
          }
        >
          {title}
        </h2>
        <div className="mt-2 text-xs text-foreground/50">
          <PublishedAt publishedAt={publishedAt} />
        </div>
      </div>
    </Link>
  );
}
