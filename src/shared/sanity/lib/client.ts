import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

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
