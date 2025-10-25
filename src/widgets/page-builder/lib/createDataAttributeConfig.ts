import { client as sanityClient } from '@/shared/sanity/lib/client';

const { projectId, dataset, stega } = sanityClient.config();
export const createDataAttributeConfig = {
  projectId,
  dataset,
  baseUrl: typeof stega.studioUrl === 'string' ? stega.studioUrl : '',
};
