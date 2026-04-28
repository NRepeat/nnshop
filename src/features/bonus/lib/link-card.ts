import { prisma } from '@shared/lib/prisma';
import { formatPhoneE164 } from '@shared/lib/validation/phone';
import { randomUUID } from 'node:crypto';

export const STUB_USER_ID_PREFIX = 'loyalty-';

export function isStubUser(user: { id: string; isAnonymous?: boolean | null } | null): boolean {
  return (
    !!user &&
    user.id.startsWith(STUB_USER_ID_PREFIX) &&
    user.isAnonymous === true
  );
}

/**
 * Transfer a seeded loyalty card from its stub User to the real User who just
 * provided their phone number. Card.phone is the unique key.
 *
 * Safe to call repeatedly: no-op if no card exists for the phone, if card is
 * already on the target user, or if the current owner is a real user (not a stub).
 *
 * Stub Users are detected by id prefix `loyalty-` AND isAnonymous=true (created
 * by `prisma/seed-loyalty.ts`).
 */
export async function linkLoyaltyCardByPhone(
  rawPhone: string,
  userId: string,
): Promise<{ linked: boolean; cardId?: string; reason?: string }> {
  const e164 = formatPhoneE164(rawPhone);
  if (!e164) return { linked: false, reason: 'invalid phone' };

  const card = await prisma.loyaltyCards.findUnique({
    where: { phone: e164 },
    select: { id: true, userId: true },
  });
  if (!card) return { linked: false, reason: 'no card for phone' };
  if (card.userId === userId) {
    return { linked: false, cardId: card.id, reason: 'already linked' };
  }

  const oldOwner = await prisma.user.findUnique({
    where: { id: card.userId },
    select: { id: true, isAnonymous: true },
  });

  if (!isStubUser(oldOwner)) {
    return {
      linked: false,
      cardId: card.id,
      reason: 'card owned by real user — manual merge required',
    };
  }

  await prisma.loyaltyCards.update({
    where: { id: card.id },
    data: { userId },
  });
  console.log(
    `[loyalty] linked card ${card.id} → user ${userId} (was stub ${oldOwner!.id})`,
  );
  return { linked: true, cardId: card.id };
}

/**
 * Ensure the user has a loyalty card for their phone.
 *  - Links existing seeded card if owned by a stub user.
 *  - Creates a new card if no card exists for this phone.
 *  - Skips if phone already linked to a different real user.
 */
export async function ensureLoyaltyCardForUser(
  rawPhone: string,
  userId: string,
  cardName?: string,
): Promise<{ action: 'linked' | 'created' | 'already_owned' | 'skipped'; cardId?: string; reason?: string }> {
  const e164 = formatPhoneE164(rawPhone);
  if (!e164) return { action: 'skipped', reason: 'invalid phone' };

  const existing = await prisma.loyaltyCards.findUnique({
    where: { phone: e164 },
    select: { id: true, userId: true },
  });

  if (existing) {
    if (existing.userId === userId) {
      return { action: 'already_owned', cardId: existing.id };
    }
    const result = await linkLoyaltyCardByPhone(rawPhone, userId);
    return result.linked
      ? { action: 'linked', cardId: result.cardId }
      : { action: 'skipped', reason: result.reason, cardId: result.cardId };
  }

  const newCard = await prisma.loyaltyCards.create({
    data: {
      id: randomUUID(),
      name: cardName ?? `Накопичувальна ${e164}`,
      phone: e164,
      userId,
      bonusBalance: 0,
    },
  });
  console.log(`[loyalty] created card ${newCard.id} for user ${userId} (phone ${e164})`);
  return { action: 'created', cardId: newCard.id };
}
