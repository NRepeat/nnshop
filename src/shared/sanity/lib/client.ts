import { createClient } from 'next-sanity';

import { apiVersion, dataset, projectId } from '../env';
import { QueryParams } from 'sanity';

export const client = createClient({
  projectId,
  dataset,
  stega: {
    enabled: true,
    studioUrl: process.env.NEXT_PUBLIC_BASE_URL + '/studio',
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
  return client.fetch(query, params, {
    next: {
      revalidate: tags.length ? false : revalidate,
      tags,
    },
  });
}
