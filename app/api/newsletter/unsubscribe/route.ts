import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@shared/lib/prisma';
import { verifyUnsubscribeToken } from '@features/newsletter/lib/token';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  if (!email || !token) {
    return NextResponse.json({ error: 'Недійсне посилання.' }, { status: 400 });
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return NextResponse.json({ error: 'Недійсний токен.' }, { status: 403 });
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { email } });

  if (!subscriber) {
    return NextResponse.json({ error: 'Email не знайдено.' }, { status: 404 });
  }

  if (subscriber.unsubscribedAt) {
    return NextResponse.json({ success: true, alreadyUnsubscribed: true });
  }

  await prisma.newsletterSubscriber.update({
    where: { email },
    data: { unsubscribedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
