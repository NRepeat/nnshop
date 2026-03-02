import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@shared/lib/prisma';
import { getProductsByHandles } from '@entities/recently-viewed/api/get-products-by-handles';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json([]);
  }

  const locale = req.nextUrl.searchParams.get('locale') ?? 'uk';

  const records = await prisma.recentlyViewedProduct.findMany({
    where: { userId: session.user.id },
    orderBy: { viewedAt: 'desc' },
    take: 10,
    select: { productHandle: true },
  });

  if (records.length === 0) return NextResponse.json([]);

  const handles = records.map((r) => r.productHandle);
  const products = await getProductsByHandles(handles, locale);

  return NextResponse.json(products);
}
