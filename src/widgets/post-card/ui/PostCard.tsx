import {
  POSTS_QUERYResult,
  POSTS_BY_LANGUAGE_QUERYResult,
} from '@/shared/sanity/types';
import { urlFor } from '@/shared/sanity/lib/image';
import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';import { Author } from '@/entities/author';
import { Categories } from '@/entities/category';
import { PublishedAt } from '@/entities/published-at';
import { getContentLanguageInfo } from '@/shared/lib/locale';

export function PostCard(
  props: (POSTS_QUERYResult[0] | POSTS_BY_LANGUAGE_QUERYResult[0]) & {
    currentLocale?: string;
  },
) {
  const {
    title,
    author,
    mainImage,
    publishedAt,
    categories,
    language,
    currentLocale,
  } = props;

  // Get content language info including fallback detection
  const languageInfo = getContentLanguageInfo(language, currentLocale || 'en');

  // Generate locale-aware URL
  // For default documents (language === 'en' or null), always use /posts/
  // For translated documents, use the locale prefix
  const postUrl =
    language && language !== 'en' && language !== null
      ? `/${language}/posts/${props.slug!.current}`
      : `/posts/${props.slug!.current}`;

  return (
    <Link className="group" href={postUrl}>
      <article className="flex flex-col-reverse gap-4 md:grid md:grid-cols-12 md:gap-0">
        <div className="md:col-span-2 md:pt-1">
          <Categories categories={categories} />
        </div>
        <div className="md:col-span-5 md:w-full">
          <div className="flex items-start gap-2 mb-2">
            <h2 className="text-2xl text-pretty font-semibold text-slate-800 group-hover:text-pink-600 transition-colors relative flex-1">
              <span className="relative z-[1]">{title}</span>
              <span className="bg-pink-50 z-0 absolute inset-0 rounded-lg opacity-0 transition-all group-hover:opacity-100 group-hover:scale-y-110 group-hover:scale-x-105 scale-75" />
            </h2>
            {languageInfo.shouldShowIndicator && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full flex-shrink-0 mt-1">
                {languageInfo.indicatorText}
              </span>
            )}
          </div>
          <div className="flex items-center mt-2 md:mt-6 gap-x-6">
            <Author author={author} />
            <PublishedAt publishedAt={publishedAt} />
          </div>
        </div>
        <div className="md:col-start-9 md:col-span-4 rounded-lg overflow-hidden flex">
          {mainImage ? (
            <Image
              src={urlFor(mainImage).width(400).height(200).url()}
              width={400}
              height={200}
              alt={mainImage.alt || title || ''}
            />
          ) : null}
        </div>
      </article>
    </Link>
  );
}
