import { getProductsByHandles } from '@entities/recently-viewed/api/get-products-by-handles';
import { NextRequest, NextResponse } from 'next/server';

const MAX_HANDLES = 20;

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') ?? 'uk';
  const raw = req.nextUrl.searchParams.get('handles') ?? '';
  const handles = raw
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean)
    .slice(0, MAX_HANDLES);

  if (handles.length === 0) return NextResponse.json([]);

  const products = await getProductsByHandles(handles, locale);

  return NextResponse.json(products, {
    headers: {
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
