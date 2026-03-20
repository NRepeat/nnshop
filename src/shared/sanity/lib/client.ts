import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';
import { QueryParams } from 'sanity';
import { token } from './token';
import { draftMode } from 'next/headers';

const studioUrl = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/studio`
  : typeof window !== 'undefined'
    ? `${window.location.origin}/studio`
    : '/studio';

export const client = createClient({
  projectId,
  dataset,
  stega: {
    enabled: process.env.NODE_ENV === 'development',
    studioUrl,
  },
  apiVersion,
  useCdn: true,
});

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  revalidate = 60,
  tags = [],
}: {
  query: QueryString;
  params?: QueryParams;
  revalidate?: number | false;
  tags?: string[];
}) {
  const { isEnabled: isDraftMode } = await draftMode();

  if (isDraftMode && !token) {
    throw new Error('The `SANITY_API_READ_TOKEN` environment variable is required.');
  }

  return client.fetch(query, params, {
    ...(isDraftMode && {
      token: token,
      perspective: 'drafts',
      stega: true,
      useCdn: false,
    }),
    next: {
      revalidate: isDraftMode ? 0 : (tags.length ? false : revalidate),
      tags,
    },
  });
}
