import {
  POSTS_BY_LANGUAGE_QUERY,
  POSTS_EN_FALLBACK_QUERY,
} from '@/sanity/lib/query';
import { Title } from '@/components/blog/Title';
import { PostCard } from '@/components/blog/PostCard';
import { sanityFetch } from '@/sanity/lib/client';
type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  // Debug: Simple direct query for Ukrainian
  console.log('Requested locale:', locale);

  // Try direct Ukrainian posts first
  let posts = [];
  let hasFallbackContent = false;

  if (locale === 'ua') {
    // Direct query for Ukrainian posts
    posts = await sanityFetch({
      query: POSTS_BY_LANGUAGE_QUERY,
      params: { language: 'ua' },
      revalidate: 0, // No cache for debugging
    });

    console.log('Ukrainian posts found:', posts.length);

    // If no Ukrainian posts, get English as fallback
    if (posts.length === 0) {
      posts = await sanityFetch({
        query: POSTS_EN_FALLBACK_QUERY,
        revalidate: 0,
      });
      hasFallbackContent = posts.length > 0;
      console.log('English fallback posts:', posts.length);
    }
  } else {
    // For English or other locales
    posts = await sanityFetch({
      query: POSTS_EN_FALLBACK_QUERY,
      revalidate: 0,
    });
  }

  return (
    <main className="container mx-auto grid grid-cols-1 gap-6 p-12">
      <Title>Post Index ({locale})</Title>

      {/* Debug info */}
      <div className="bg-yellow-100 p-4 rounded mb-4">
        <p>
          <strong>Debug Info:</strong>
        </p>
        <p>Requested locale: {locale}</p>
        <p>Posts found: {posts.length}</p>
        <p>Has fallback content: {hasFallbackContent ? 'Yes' : 'No'}</p>
      </div>

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
