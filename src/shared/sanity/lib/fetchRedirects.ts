import { client as sanityClient } from './client';
import { REDIRECTS_QUERY } from './query';

export async function fetchRedirects() {
  return sanityClient.fetch(REDIRECTS_QUERY);
}
