/**
 * Seed loyalty data from /Users/mnmac/1c-miomio/shop.db (sqlite) into nnshop Postgres.
 *
 * Strategy:
 *  - Match LoyaltyCards.phone against ContactInformation.phone → existing User.
 *  - If no match, create stub User (isAnonymous=true, deterministic id `loyalty-<phone>`).
 *  - Phone normalized to `+380XXXXXXXXX`.
 *  - Idempotent: upsert by id for cards and movements.
 *
 * Run:
 *   npx tsx prisma/seed-loyalty.ts                  # write
 *   npx tsx prisma/seed-loyalty.ts --dry-run        # no writes, report only
 *   SOURCE_DB=/path/to/shop.db npx tsx prisma/seed-loyalty.ts
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { prisma } from '../src/shared/lib/prisma';
import { BonusMoveType } from '../generated/prisma/enums';

const SOURCE_DB =
  process.env.SOURCE_DB || '/Users/mnmac/1c-miomio/shop.db';
const DRY_RUN =
  process.argv.includes('--dry-run') || process.env.DRY_RUN === '1';

type SrcCard = {
  id: string;
  name: string;
  phone: string;
  customerId: string;
  bonusBalance: number;
  lastAccrualDate: string | null;
  allExpireBy: string | null;
};

type SrcMovement = {
  id: string;
  loyaltyCardId: string;
  date: string;
  type: 'ACCRUAL' | 'SPEND' | 'EXPIRY';
  amount: number;
  createdAt: string;
};

function sqliteJson<T>(db: string, sql: string): T[] {
  const out = execFileSync('sqlite3', ['-json', db, sql], {
    maxBuffer: 200 * 1024 * 1024,
  }).toString();
  return out.trim() ? (JSON.parse(out) as T[]) : [];
}

function normalizePhone(raw: string): string | null {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10 && digits.startsWith('0')) return `+38${digits}`;
  if (digits.length === 12 && digits.startsWith('380')) return `+${digits}`;
  if (digits.length === 9) return `+380${digits}`;
  if (digits.length === 11 && digits.startsWith('80')) return `+3${digits}`;
  return null;
}

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function main() {
  if (!existsSync(SOURCE_DB)) {
    throw new Error(`Source DB not found: ${SOURCE_DB}`);
  }
  console.log(`📂 Source: ${SOURCE_DB}`);
  console.log(`🗄️  Target: ${process.env.DATABASE_URL?.split('@')[1] ?? '<unknown>'}`);
  if (DRY_RUN) console.log('🧪 DRY RUN — no writes');

  const srcCards = sqliteJson<SrcCard>(
    SOURCE_DB,
    'SELECT id, name, phone, customerId, bonusBalance, lastAccrualDate, allExpireBy FROM loyalty_cards;',
  );
  const srcMovements = sqliteJson<SrcMovement>(
    SOURCE_DB,
    'SELECT id, loyaltyCardId, date, type, amount, createdAt FROM bonus_movements;',
  );
  console.log(`  cards: ${srcCards.length}, movements: ${srcMovements.length}`);

  // Dedupe cards by normalized phone — keep card with highest bonusBalance.
  const byPhone = new Map<string, SrcCard>();
  const droppedCardIds = new Set<string>();
  let invalidPhone = 0;
  for (const c of srcCards) {
    const phone = normalizePhone(c.phone);
    if (!phone) {
      invalidPhone++;
      droppedCardIds.add(c.id);
      continue;
    }
    const existing = byPhone.get(phone);
    if (!existing || c.bonusBalance > existing.bonusBalance) {
      if (existing) droppedCardIds.add(existing.id);
      byPhone.set(phone, c);
    } else {
      droppedCardIds.add(c.id);
    }
  }
  console.log(
    `  unique phones: ${byPhone.size}, dropped dupes: ${droppedCardIds.size}, invalid phones: ${invalidPhone}`,
  );

  // Build canonical cardId remap: dropped card id → kept card id.
  // Bonus movements that reference dropped cards are reassigned to the kept one.
  const cardIdRemap = new Map<string, string>();
  for (const c of srcCards) {
    const phone = normalizePhone(c.phone);
    if (!phone) continue;
    const kept = byPhone.get(phone);
    if (kept && kept.id !== c.id) cardIdRemap.set(c.id, kept.id);
  }

  // Lookup existing users by phone (ContactInformation.phone).
  const allPhones = [...byPhone.keys()];
  const existingContacts = await prisma.contactInformation.findMany({
    where: { phone: { in: allPhones } },
    select: { phone: true, userId: true },
  });
  const phoneToUser = new Map(
    existingContacts.map((c) => [c.phone, c.userId]),
  );
  console.log(`  matched existing users: ${phoneToUser.size}`);

  // Sample existing card ids for write/skip stats in dry-run.
  let existingCardCount = 0;
  if (DRY_RUN) {
    const cardIds = [...byPhone.values()].map((c) => c.id);
    const found = await prisma.loyaltyCards.findMany({
      where: { id: { in: cardIds } },
      select: { id: true },
    });
    existingCardCount = found.length;
  }

  // Upsert stub users + cards.
  let createdStubs = 0;
  let upsertedCards = 0;
  const cards = [...byPhone.entries()];
  for (let i = 0; i < cards.length; i++) {
    const [phone, c] = cards[i];
    let userId = phoneToUser.get(phone);
    if (!userId) {
      const stubId = `loyalty-${phone.replace(/\D/g, '')}`;
      const stubEmail = `loyalty-${phone.replace(/\D/g, '')}@miomio.local`;
      if (!DRY_RUN) {
        await prisma.user.upsert({
          where: { id: stubId },
          update: { name: c.name },
          create: {
            id: stubId,
            name: c.name,
            email: stubEmail,
            emailVerified: false,
            isAnonymous: true,
            contactInformation: {
              create: {
                name: c.name,
                lastName: '',
                email: stubEmail,
                phone,
                countryCode: 'UA',
              },
            },
          },
        });
      }
      userId = stubId;
      phoneToUser.set(phone, userId);
      createdStubs++;
    }

    if (!DRY_RUN) {
      await prisma.loyaltyCards.upsert({
        where: { id: c.id },
        update: {
          name: c.name,
          phone,
          userId,
          bonusBalance: c.bonusBalance,
          lastAccrualDate: parseDate(c.lastAccrualDate),
          allExpireBy: parseDate(c.allExpireBy),
        },
        create: {
          id: c.id,
          name: c.name,
          phone,
          userId,
          bonusBalance: c.bonusBalance,
          lastAccrualDate: parseDate(c.lastAccrualDate),
          allExpireBy: parseDate(c.allExpireBy),
        },
      });
    }
    upsertedCards++;
    if (!DRY_RUN && upsertedCards % 200 === 0) {
      console.log(`    cards ${upsertedCards}/${cards.length}`);
    }
  }
  console.log(`  stub users to create: ${createdStubs}`);
  console.log(`  cards to upsert: ${upsertedCards}`);
  if (DRY_RUN) {
    console.log(`    of which already in DB (would update): ${existingCardCount}`);
    console.log(`    new (would insert): ${upsertedCards - existingCardCount}`);
  }

  // Movements: remap dropped card ids, skip orphans.
  const validCardIds = new Set([...byPhone.values()].map((c) => c.id));
  const validMovements: SrcMovement[] = [];
  let orphaned = 0;
  for (const m of srcMovements) {
    const targetCardId = cardIdRemap.get(m.loyaltyCardId) ?? m.loyaltyCardId;
    if (!validCardIds.has(targetCardId)) {
      orphaned++;
      continue;
    }
    validMovements.push({ ...m, loyaltyCardId: targetCardId });
  }
  console.log(`  movements valid: ${validMovements.length}, orphaned: ${orphaned}`);

  if (DRY_RUN) {
    const movementIds = validMovements.map((m) => m.id);
    const sampleSize = Math.min(movementIds.length, 5000);
    const sample = movementIds.slice(0, sampleSize);
    const found = await prisma.bonusMovements.findMany({
      where: { id: { in: sample } },
      select: { id: true },
    });
    const sampleHitRate = sample.length ? found.length / sample.length : 0;
    const estExisting = Math.round(sampleHitRate * movementIds.length);
    const estNew = movementIds.length - estExisting;
    console.log(
      `  movements (estimate from sample of ${sample.length}): would insert new ~${estNew}, skip dup ~${estExisting}`,
    );
    console.log('✅ DRY RUN complete — no writes performed.');
    return;
  }

  // Bulk createMany w/ skipDuplicates for idempotency.
  const BATCH = 1000;
  let inserted = 0;
  for (let i = 0; i < validMovements.length; i += BATCH) {
    const slice = validMovements.slice(i, i + BATCH);
    const res = await prisma.bonusMovements.createMany({
      data: slice.map((m) => ({
        id: m.id,
        loyaltyCardId: m.loyaltyCardId,
        date: new Date(m.date),
        type: m.type as BonusMoveType,
        amount: m.amount,
        createdAt: new Date(m.createdAt),
      })),
      skipDuplicates: true,
    });
    inserted += res.count;
    console.log(`    movements ${Math.min(i + BATCH, validMovements.length)}/${validMovements.length} (new: ${res.count})`);
  }
  console.log(`  movements inserted (new): ${inserted}`);

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
