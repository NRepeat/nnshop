import { PortableText } from 'next-sanity';
import { POST_QUERYResult } from '@/shared/sanity/types';
import { urlFor } from '@/shared/sanity/lib/image';
import Image from 'next/image';
import { components } from '@/shared/sanity/components/portableText';
import { Author } from './Author';
import { Categories } from './Categories';
import { PublishedAt } from './PublishedAt';
import { Title } from './Title';
import { RelatedPosts } from './RelatedPosts';
import { getContentLanguageInfo } from '@/shared/lib/locale';

export function Post(
  props: NonNullable<POST_QUERYResult> & { currentLocale?: string },
) {
  const {
    _id,
    title,
    author,
    mainImage,
    body,
    publishedAt,
    categories,
    relatedPosts,
    language,
    currentLocale,
  } = props;

  const languageInfo = getContentLanguageInfo(language, currentLocale || 'en');
  return (
    <article className="grid lg:grid-cols-12 gap-y-12">
      <header className="lg:col-span-12 flex flex-col gap-4 items-start">
        <div className="flex gap-4 items-center">
          <Categories categories={categories} />
          <PublishedAt publishedAt={publishedAt} />
          {languageInfo.shouldShowIndicator && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
              {languageInfo.indicatorText}
            </span>
          )}
        </div>
        <Title>{title}</Title>
        <Author author={author} />
      </header>
      {mainImage ? (
        <figure className="lg:col-span-4 flex flex-col gap-2 items-start">
          <Image
            src={urlFor(mainImage).width(400).height(400).url()}
            width={400}
            height={400}
            alt=""
          />
        </figure>
      ) : null}
      {body ? (
        <div className="lg:col-span-7 lg:col-start-6 prose lg:prose-lg">
          <PortableText value={body} components={components} />
          <RelatedPosts
            relatedPosts={relatedPosts}
            documentId={_id}
            documentType="post"
          />
        </div>
      ) : null}
    </article>
  );
}
