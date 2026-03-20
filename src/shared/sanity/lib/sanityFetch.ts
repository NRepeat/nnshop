import { QueryParams } from 'sanity';
import { draftMode } from 'next/headers';
import { client } from './client';
import { token } from './token';

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
  let isDraftMode = false;

  // draftMode() is only available in the app directory and only during request time
  // It will throw an error when used during static generation or build phase
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    try {
      const dm = await draftMode();
      isDraftMode = dm.isEnabled;
    } catch {
      // ignore
    }
  }

  if (isDraftMode && !token) {
    throw new Error(
      'The `SANITY_API_READ_TOKEN` environment variable is required.',
    );
  }

  return client.fetch(query, params, {
    ...(isDraftMode && {
      token: token,
      perspective: 'drafts',
      stega: true,
      useCdn: false,
    }),
    next: {
      revalidate: isDraftMode ? 0 : tags.length ? false : revalidate,
      tags,
    },
  });
}
