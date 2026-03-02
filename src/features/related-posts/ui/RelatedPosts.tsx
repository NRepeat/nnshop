'use client';

import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import { urlFor } from '@shared/sanity/lib/image';
import { createDataAttribute } from 'next-sanity';
import { POST_QUERYResult } from '@/shared/sanity/types';
import { client } from '@/shared/sanity/lib/client';
import { useOptimistic } from 'next-sanity/hooks';

const { projectId, dataset, stega } = client.config();
export const createDataAttributeConfig = {
  projectId,
  dataset,
  baseUrl: typeof stega.studioUrl === 'string' ? stega.studioUrl : '',
};

export function RelatedPosts({
  relatedPosts,
  documentId,
  documentType,
}: {
  relatedPosts: NonNullable<POST_QUERYResult>['relatedPosts'];
  documentId: string;
  documentType: string;
}) {
  const posts = useOptimistic<
    NonNullable<POST_QUERYResult>['relatedPosts'] | undefined,
    NonNullable<POST_QUERYResult>
  >(relatedPosts, (state, action) => {
    if (action.id === documentId && action?.document?.relatedPosts) {
      return action.document.relatedPosts.map(
        (post) => state?.find((p) => p._key === post._key) ?? post,
      );
    }
    return state;
  });

  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-12">
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4"
        data-sanity={createDataAttribute({
          ...createDataAttributeConfig,
          id: documentId,
          type: documentType,
          path: 'relatedPosts',
        }).toString()}
      >
        {posts.map((post) => (
          <Link
            key={post._key}
            href={`/blog/${post?.slug?.current}`}
            className="group"
            data-sanity={createDataAttribute({
              ...createDataAttributeConfig,
              id: documentId,
              type: documentType,
              path: `relatedPosts[_key=="${post._key}"]`,
            }).toString()}
          >
            <article className="flex flex-col gap-3">
              {post.mainImage && (
                <div className="relative aspect-video overflow-hidden rounded bg-gray-100">
                  <Image
                    src={urlFor(post.mainImage).url()}
                    alt={post.title || ''}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="m-0! object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded inset-shadow-sm" />
                </div>
              )}
              <h3 className="text-base font-medium line-clamp-2 group-hover:underline duration-300 decoration-transparent group-hover:decoration-primary transition-all">
                {post.title}
              </h3>
              {post.publishedAt && (
                <p className="text-sm text-gray-500">
                  {new Date(post.publishedAt).toLocaleDateString('uk-UA')}
                </p>
              )}
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
