import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

// 1. Updated type definition to expect an array of paths
type WebhookPayload = { paths?: string[] };

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SANITY_REVALIDATE_SECRET) {
      return new Response(
        'Missing environment variable SANITY_REVALIDATE_SECRET',
        { status: 500 },
      );
    }

    // Use the updated WebhookPayload type
    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    );

    if (!isValidSignature) {
      const message = 'Invalid signature';
      return new Response(JSON.stringify({ message, isValidSignature, body }), {
        status: 401,
      });
    }

    // 2. Updated check for the 'paths' array
    else if (
      !body?.paths ||
      !Array.isArray(body.paths) ||
      body.paths.length === 0
    ) {
      const message = 'Bad Request: Missing or empty paths array';
      return new Response(JSON.stringify({ message, body }), { status: 400 });
    }

    // 3. Iterate and revalidate all paths
    const revalidatedPaths: string[] = [];

    for (const path of body.paths) {
      revalidatePath(path);
      revalidatedPaths.push(path);
    }

    const message = `Updated routes: ${revalidatedPaths.join(', ')}`;
    return NextResponse.json({ body, message, revalidated: true });
  } catch (err) {
    console.error(err);
    return new Response((err as Error).message, { status: 500 });
  }
}
