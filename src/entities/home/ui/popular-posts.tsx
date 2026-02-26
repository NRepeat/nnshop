import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import { urlFor } from '@shared/sanity/lib/image';

type PopularPost = {
  _id: string;
  title?: string | null;
  slug?: { current?: string | null } | null;
  mainImage?: { asset?: { _ref: string } } | null;
  publishedAt?: string | null;
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
    <section className="container py-12">
      {title != null && (
        <p className="px-4 text-xl font-400 mb-8">{title as string}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {posts.map((post) => (
          <Link key={post._id} href={`/blog/${post.slug?.current}`} className="group">
            <article className="flex flex-col gap-3">
              {post.mainImage && (
                <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={urlFor(post.mainImage).width(600).height(338).url()}
                    alt={post.title || ''}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <h3 className="text-base font-medium line-clamp-2 group-hover:border-b group-hover:border-current transition-colors">
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
};
