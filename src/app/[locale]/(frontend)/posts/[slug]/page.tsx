import { sanityFetch } from '@/sanity/lib/live';
import { notFound } from 'next/navigation';

import { POST_QUERY } from '@/sanity/lib/query';

import { Post } from '@/components/blog/Post';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { data: post } = await sanityFetch({
    query: POST_QUERY,
    params: await params,
  });

  if (!post) {
    notFound();
  }

  return (
    <main className="container mx-auto grid grid-cols-1 gap-6 p-12">
      <Post {...post} />
    </main>
  );
}
