'use server';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ confirmed: false }, { status: 401 });

  const orderId = request.nextUrl.searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ confirmed: false }, { status: 400 });

  const order = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      OR: [
        { shopifyOrderId: { contains: orderId } },
        { shopifyDraftOrderId: { contains: orderId } },
        { orderName: { contains: orderId } },
      ],
    },
    select: { id: true, draft: true, shopifyOrderId: true, orderName: true },
  });

  if (!order) return NextResponse.json({ confirmed: false, notFound: true });
  return NextResponse.json({ confirmed: !order.draft });
}
