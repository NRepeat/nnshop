import { NextRequest, NextResponse } from 'next/server';
import { getActiveViewers } from '@shared/lib/posthog/getActiveViewers';

export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get('handle');
  console.log('[api/viewers] handle:', handle);
  if (!handle) return NextResponse.json({ count: 0 });

  const count = await getActiveViewers(`/product/${handle}`);
  console.log('[api/viewers] PostHog count:', count);
  return NextResponse.json(
    { count },
    { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } },
  );
}
