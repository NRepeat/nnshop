import { PortableText } from 'next-sanity';
import { POST_QUERYResult } from '@/shared/sanity/types';
import { urlFor } from '@/shared/sanity/lib/image';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@shared/i18n/navigation';
import { components } from '@/shared/sanity/components/portableText';
import { Author } from '@/entities/author';
import { Categories } from '@/entities/category';
import { PublishedAt } from '@/entities/published-at';
import { RelatedPosts } from '@/features/related-posts';
import { getContentLanguageInfo } from '@/shared/lib/locale';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@shared/ui/breadcrumb';
import { JsonLd } from '@shared/ui/JsonLd';
import { generateBreadcrumbJsonLd } from '@shared/lib/seo/jsonld/breadcrumb';
import { SITE_URL } from '@shared/config/brand';

export async function Post(
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

  const locale = currentLocale || 'uk';
  const languageInfo = getContentLanguageInfo(language, locale);
  const tHeader = await getTranslations({ locale, namespace: 'Header' });
  const tFooter = await getTranslations({ locale, namespace: 'Footer' });
  const homeLabel = tHeader('nav.home');
  const blogLabel = tFooter('blog');
  const backLabel = locale === 'ru' ? 'Все статьи' : 'Усі статті';

  const slug =
    typeof (props as { slug?: unknown }).slug === 'string'
      ? ((props as { slug?: string }).slug as string)
      : undefined;

  const breadcrumbItems = [
    { name: homeLabel, url: `${SITE_URL}/${locale}` },
    { name: blogLabel, url: `${SITE_URL}/${locale}/blog` },
    ...(title
      ? [{ name: title, url: `${SITE_URL}/${locale}/blog/${slug ?? ''}` }]
      : []),
  ];

  return (
    <article className="mx-auto max-w-3xl">
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbItems)} />

      <Breadcrumb className="mb-6 md:mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${locale}`}>{homeLabel}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${locale}/blog`}>
              {blogLabel}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {title ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1 max-w-[18ch] sm:max-w-[28ch]">
                  {title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col items-start gap-3 pb-6 md:pb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Categories categories={categories} />
          <PublishedAt publishedAt={publishedAt} />
          {languageInfo.shouldShowIndicator && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
              {languageInfo.indicatorText}
            </span>
          )}
        </div>
        <h1 className="text-balance text-3xl md:text-4xl font-semibold tracking-[-0.02em] leading-[1.1] text-foreground">
          {title}
        </h1>
        {author?.name || author?.image ? (
          <div className="pt-1">
            <Author author={author} />
          </div>
        ) : null}
      </header>

      {mainImage ? (
        <figure className="relative mb-8 md:mb-10 overflow-hidden rounded-lg bg-muted">
          <Image
            src={urlFor(mainImage).width(1200).height(675).url()}
            width={1200}
            height={675}
            alt={mainImage.alt || title || ''}
            className="h-auto w-full object-cover"
            priority
          />
        </figure>
      ) : null}

      {body ? (
        <div className="prose-none">
          <PortableText value={body} components={components} />
        </div>
      ) : null}

      <nav className="mt-12 flex items-center justify-between gap-4 border-t border-foreground/10 pt-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </nav>

      <div className="mt-12 border-t border-foreground/10 pt-8">
        <RelatedPosts
          relatedPosts={relatedPosts}
          documentId={_id}
          documentType="post"
        />
      </div>
    </article>
  );
}
