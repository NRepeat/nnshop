/**
 * This file is used to allow Presentation to set the app in Draft Mode, which will load Visual Editing
 * and query draft content and preview the content as it will appear once everything is published
 */

import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { client as sanityClient } from '@/sanity/lib/client';
import { token } from '@/sanity/lib/token';

export const { GET } = defineEnableDraftMode({
  client: sanityClient.withConfig({ token }),
});
