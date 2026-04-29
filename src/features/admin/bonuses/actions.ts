'use server';

import { prisma } from '@shared/lib/prisma';
import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@features/auth/lib/is-admin';
import { formatPhoneE164 } from '@shared/lib/validation/phone';
import { isStubUser } from '@features/bonus/lib/link-card';

export type CardSearchResult = {
  id: string;
  name: string;
  phone: string;
  bonusBalance: number;
  isStub: boolean;
  userEmail: string | null;
};

const SEARCH_LIMIT = 30;

export async function searchLoyaltyCards(query: string): Promise<CardSearchResult[]> {
  const session = await getAdminSession();
  if (!session) throw new Error('UNAUTHORIZED');

  const trimmed = query.trim();
  if (!trimmed) return [];

  const e164 = formatPhoneE164(trimmed);
  const phoneCandidates = new Set<string>();
  phoneCandidates.add(trimmed);
  if (e164) phoneCandidates.add(e164);

  const cards = await prisma.loyaltyCards.findMany({
    where: {
      OR: [
        { name: { contains: trimmed, mode: 'insensitive' } },
        { phone: { in: Array.from(phoneCandidates) } },
        { phone: { contains: trimmed } },
      ],
    },
    select: {
      id: true,
      name: true,
      phone: true,
      bonusBalance: true,
      user: {
        select: { id: true, email: true, isAnonymous: true },
      },
    },
    orderBy: { bonusBalance: 'desc' },
    take: SEARCH_LIMIT,
  });

  return cards.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    bonusBalance: c.bonusBalance,
    isStub: isStubUser(c.user),
    userEmail: isStubUser(c.user) ? null : c.user.email,
  }));
}

export type CardDetail = {
  id: string;
  name: string;
  phone: string;
  bonusBalance: number;
  isStub: boolean;
  userEmail: string | null;
  movements: {
    id: string;
    date: string;
    type: string;
    amount: number;
    note: string | null;
    actorEmail: string | null;
  }[];
};

export async function getCardDetail(cardId: string): Promise<CardDetail | null> {
  const session = await getAdminSession();
  if (!session) throw new Error('UNAUTHORIZED');

  const card = await prisma.loyaltyCards.findUnique({
    where: { id: cardId },
    select: {
      id: true,
      name: true,
      phone: true,
      bonusBalance: true,
      user: { select: { id: true, email: true, isAnonymous: true } },
      bonus_movements: {
        orderBy: { date: 'desc' },
        select: {
          id: true,
          date: true,
          type: true,
          amount: true,
          note: true,
          actorUserId: true,
        },
      },
    },
  });

  if (!card) return null;

  const actorIds = Array.from(
    new Set(card.bonus_movements.map((m) => m.actorUserId).filter(Boolean) as string[]),
  );
  const actors = actorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, email: true },
      })
    : [];
  const actorMap = new Map(actors.map((a) => [a.id, a.email]));

  return {
    id: card.id,
    name: card.name,
    phone: card.phone,
    bonusBalance: card.bonusBalance,
    isStub: isStubUser(card.user),
    userEmail: isStubUser(card.user) ? null : card.user.email,
    movements: card.bonus_movements.map((m) => ({
      id: m.id,
      date: m.date.toISOString(),
      type: m.type,
      amount: m.amount,
      note: m.note,
      actorEmail: m.actorUserId ? (actorMap.get(m.actorUserId) ?? null) : null,
    })),
  };
}

export type DashboardStats = {
  totalCards: number;
  registeredCards: number;
  stubCards: number;
  totalBalance: number;
  recentMovements30d: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await getAdminSession();
  if (!session) throw new Error('UNAUTHORIZED');

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [totalCards, stubCards, balanceAgg, recentMovements30d] = await Promise.all([
    prisma.loyaltyCards.count(),
    prisma.loyaltyCards.count({
      where: {
        user: { isAnonymous: true, id: { startsWith: 'loyalty-' } },
      },
    }),
    prisma.loyaltyCards.aggregate({ _sum: { bonusBalance: true } }),
    prisma.bonusMovements.count({ where: { date: { gte: since } } }),
  ]);

  return {
    totalCards,
    registeredCards: totalCards - stubCards,
    stubCards,
    totalBalance: balanceAgg._sum.bonusBalance ?? 0,
    recentMovements30d,
  };
}

export type RecentCard = {
  id: string;
  name: string;
  phone: string;
  bonusBalance: number;
  isStub: boolean;
  userEmail: string | null;
};

export async function getTopCards(limit = 10): Promise<RecentCard[]> {
  const session = await getAdminSession();
  if (!session) throw new Error('UNAUTHORIZED');

  const cards = await prisma.loyaltyCards.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      bonusBalance: true,
      user: { select: { id: true, email: true, isAnonymous: true } },
    },
    orderBy: { bonusBalance: 'desc' },
    take: limit,
  });

  return cards.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    bonusBalance: c.bonusBalance,
    isStub: isStubUser(c.user),
    userEmail: isStubUser(c.user) ? null : c.user.email,
  }));
}

export async function adjustBonus(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: 'UNAUTHORIZED' };

  const cardId = String(formData.get('cardId') || '');
  const amountRaw = String(formData.get('amount') || '');
  const note = String(formData.get('note') || '').trim();

  if (!cardId) return { ok: false, error: 'cardId required' };
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount === 0) {
    return { ok: false, error: 'amount must be non-zero number' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const card = await tx.loyaltyCards.findUnique({
        where: { id: cardId },
        select: { id: true, bonusBalance: true },
      });
      if (!card) throw new Error('card not found');

      const newBalance = card.bonusBalance + amount;
      if (newBalance < 0) throw new Error('balance cannot go negative');

      await tx.bonusMovements.create({
        data: {
          id: randomUUID(),
          loyaltyCardId: cardId,
          date: new Date(),
          type: 'ADJUSTMENT',
          amount,
          note: note || null,
          actorUserId: session.user.id,
        },
      });

      await tx.loyaltyCards.update({
        where: { id: cardId },
        data: { bonusBalance: newBalance },
      });
    });

    revalidatePath(`/admin/bonuses/${cardId}`);
    revalidatePath('/admin/bonuses');
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return { ok: false, error: msg };
  }
}
