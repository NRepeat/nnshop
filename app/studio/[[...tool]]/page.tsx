import { NextStudio } from 'next-sanity/studio';
import sanityConfig from '~/sanity.config';

export { metadata, viewport } from 'next-sanity/studio';

export async function generateStaticParams() {
  return [{ tool: [] }];
}

export default function StudioPage() {
  return <NextStudio config={sanityConfig} />;
}
