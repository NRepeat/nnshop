import { revalidatePath, revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

import { revalidateSecret } from '@/shared/sanity/env';

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{
      type: string;
      slug?: string;
    }>(req, revalidateSecret);
    if (!isValidSignature) {
      const message = 'Invalid signature';
      return new Response(message, { status: 401 });
    }

    if (!body) {
      const message = 'Bad Request';
      return new Response(message, { status: 400 });
    }
    if (body.slug) {
      revalidateTag(body.slug, 'default');
      // revalidatePath('/');
    } else if (body.type) {
      // revalidatePath('/');
      revalidateTag(body.type, 'default');
    } else if (body.slug && body.type) {
      revalidateTag(body.slug, 'default');
      revalidateTag(body.type, 'default');
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
