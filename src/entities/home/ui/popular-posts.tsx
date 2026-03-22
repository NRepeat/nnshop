import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import { urlFor } from '@shared/sanity/lib/image';

type PopularPost = {
  _id: string;
  title?: string | null;
  slug?: { current?: string | null } | null;
  mainImage?: { asset?: { _ref: string } } | null;
  publishedAt?: string | null;
  localizedVersion?: {
    _id: string;
    title?: string | null;
    slug?: { current?: string | null } | null;
    mainImage?: { asset?: { _ref: string } } | null;
    publishedAt?: string | null;
  } | null;
};

type PopularPostsProps = {
  _type: 'popularPosts';
  _key: string;
  title?: unknown;
  posts?: PopularPost[] | null;
  locale: string;
};

export const PopularPosts = ({ title, posts }: PopularPostsProps) => {
  if (!posts || posts.length === 0) return null;

  return (
    <section className=" container">
      {title != null && (
        <p className="px-4 text-3xl font-400 mb-8">{title as string}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 px-4  pb-8">
        {posts.map((post) => {
          const resolved = post.localizedVersion ?? post;
          return (
            <Link
              key={post._id}
              href={`/blog/${resolved.slug?.current}`}
              className="group"
            >
              <article className="flex flex-col gap-3">
                {resolved.mainImage && (
                  <div className="relative aspect-video overflow-hidden rounded bg-gray-100 ">
                    <Image
                      src={urlFor(resolved.mainImage)
                        .width(600)
                        .height(338)
                        .url()}
                      alt={(resolved.mainImage as any)?.alt || resolved.title || ''}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded inset-shadow-sm " />
                  </div>
                )}
                <h3 className="text-base font-medium line-clamp-2 group-hover:underline  duration-300 decoration-transparent group-hover:decoration-primary  transition-all">
                  {resolved.title}
                </h3>
                {resolved.publishedAt && (
                  <p className="text-sm text-gray-500">
                    {new Date(resolved.publishedAt).toLocaleDateString('uk-UA')}
                  </p>
                )}
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
