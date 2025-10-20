import { POSTS_QUERY } from '@/sanity/lib/query';
import { Title } from '@/components/blog/Title';
import { PostCard } from '@/components/blog/PostCard';
import { sanityFetch } from '@/sanity/lib/client';

export default async function Page() {
  const posts = await sanityFetch({
    query: POSTS_QUERY,
    revalidate: 3600,
  });
  return (
    <main className="container mx-auto grid grid-cols-1 gap-6 p-12">
      <Title>Post Index</Title>
      <div className="flex flex-col gap-24 py-12">
        {posts.map((post) => (
          <PostCard key={post._id} {...post} />
        ))}
      </div>
    </main>
  );
}
