import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

const SECRET = process.env.SANITY_REVALIDATE_SECRET ?? '';

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!secret || secret !== SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  revalidateTag('menu',"default");

  return NextResponse.json({ revalidated: true, tag: 'menu', now: Date.now() });
}
