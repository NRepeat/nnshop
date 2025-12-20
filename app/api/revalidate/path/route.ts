import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

import { revalidateSecret } from '@/shared/sanity/env';

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{
      _type: string;
      slug?: string;
    }>(req, revalidateSecret);

    if (!isValidSignature) {
      const message = 'Invalid signature';
      return new Response(message, { status: 401 });
    }

    if (!body?._type) {
      const message = 'Bad Request';
      return new Response(message, { status: 400 });
    }

    revalidateTag(body._type, 'max');
    if (body.slug) {
      revalidateTag(body.slug, 'max');
    }

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      body,
    });
  } catch (err: any) {
    console.error(err);
    return new Response(err.message, { status: 500 });
  }
}
