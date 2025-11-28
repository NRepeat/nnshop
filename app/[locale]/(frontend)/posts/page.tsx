import {
  POSTS_BY_LANGUAGE_QUERY,
  POSTS_EN_FALLBACK_QUERY,
} from '@/shared/sanity/lib/query';
import { sanityFetch } from '@/shared/sanity/lib/client';
import { Title } from '@/entities/title';
import { PostCard } from '@/widgets/post-card';
type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  let posts = [];

  if (locale === 'uk') {
    posts = await sanityFetch({
      query: POSTS_BY_LANGUAGE_QUERY,
      params: { language: 'uk' },
      revalidate: 3600,
    });

    if (posts.length === 0) {
      posts = await sanityFetch({
        query: POSTS_EN_FALLBACK_QUERY,
        revalidate: 3600,
      });
    }
  } else {
    posts = await sanityFetch({
      query: POSTS_EN_FALLBACK_QUERY,
      revalidate: 0,
    });
  }

  return (
    <main className="container mx-auto grid grid-cols-1 gap-6 p-12">
      <Title>Post Index ({locale})</Title>

      <div className="flex flex-col gap-24 py-12">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id} {...post} currentLocale={locale} />
          ))
        ) : (
          <p className="text-center text-gray-600">
            No posts available for the selected language.
          </p>
        )}
      </div>
    </main>
  );
}
