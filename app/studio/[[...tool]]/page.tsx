import { NextStudio } from 'next-sanity/studio';
import { connection } from 'next/server';
import sanityConfig from '~/sanity.config';

export { metadata, viewport } from 'next-sanity/studio';

export async function generateStaticParams() {
  return [{ tool: [] }];
}

export default async function StudioPage() {
  await connection();
  return <NextStudio config={sanityConfig} />;
}
