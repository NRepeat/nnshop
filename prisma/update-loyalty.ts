/**
 * Update loyalty data from refreshed shop.db (built from new 1C dump) into nnshop Postgres.
 *
 * Differences from seed-loyalty.ts:
 *  - Match LoyaltyCards by `phone` (stable) — NOT by id, because seed-all.ts
 *    regenerates randomUUID() per run, so source ids shift between dumps.
 *  - BonusMovements use a deterministic id derived from
 *    (phone, date, type, amount, index-within-group) so re-runs are idempotent
 *    and additional dumps insert only truly new movements.
 *  - Cards present in Postgres but missing in the new dump are left untouched.
 *
 * Run:
 *   npx tsx prisma/update-loyalty.ts                # write
 *   npx tsx prisma/update-loyalty.ts --dry-run      # report only
 *   SOURCE_DB=/path/to/shop.db npx tsx prisma/update-loyalty.ts
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { prisma } from '../src/shared/lib/prisma';
import { BonusMoveType } from '../generated/prisma/enums';

const SOURCE_DB = process.env.SOURCE_DB || '/Users/mnmac/1c-miomio/shop.db';
const DRY_RUN =
  process.argv.includes('--dry-run') || process.env.DRY_RUN === '1';

type SrcCard = {
  id: string;
  name: string;
  phone: string;
  bonusBalance: number;
  lastAccrualDate: string | null;
  allExpireBy: string | null;
};

type SrcMovement = {
  loyaltyCardId: string;
  date: string;
  type: 'ACCRUAL' | 'SPEND' | 'EXPIRY';
  amount: number;
};

function sqliteJson<T>(db: string, sql: string): T[] {
  const out = execFileSync('sqlite3', ['-json', db, sql], {
    maxBuffer: 500 * 1024 * 1024,
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

function movementId(phone: string, m: SrcMovement, index: number): string {
  const phoneDigits = phone.replace(/\D/g, '');
  const key = `${phoneDigits}|${m.date}|${m.type}|${m.amount}|${index}`;
  const hash = createHash('sha1').update(key).digest('hex').slice(0, 24);
  return `bm_${phoneDigits}_${hash}`;
}

async function main() {
  if (!existsSync(SOURCE_DB)) {
    throw new Error(`Source DB not found: ${SOURCE_DB}`);
  }
  console.log(`Source: ${SOURCE_DB}`);
  console.log(`Target: ${process.env.DATABASE_URL?.split('@')[1] ?? '<unknown>'}`);
  if (DRY_RUN) console.log('DRY RUN — no writes');

  const srcCards = sqliteJson<SrcCard>(
    SOURCE_DB,
    'SELECT id, name, phone, bonusBalance, lastAccrualDate, allExpireBy FROM loyalty_cards;',
  );
  // Order by phone (stable across rebuilds) — loyaltyCardId is randomUUID per rebuild.
  const srcMovements = sqliteJson<SrcMovement & { phone: string }>(
    SOURCE_DB,
    `SELECT m.loyaltyCardId, m.date, m.type, m.amount, c.phone
     FROM bonus_movements m
     JOIN loyalty_cards c ON c.id = m.loyaltyCardId
     ORDER BY c.phone, m.date, m.type, m.amount;`,
  );
  console.log(`  src cards: ${srcCards.length}, src movements: ${srcMovements.length}`);

  // Dedupe source cards by normalized phone — keep card with highest bonusBalance.
  const byPhone = new Map<string, SrcCard>();
  let invalidPhone = 0;
  for (const c of srcCards) {
    const phone = normalizePhone(c.phone);
    if (!phone) {
      invalidPhone++;
      continue;
    }
    const existing = byPhone.get(phone);
    if (!existing || c.bonusBalance > existing.bonusBalance) {
      byPhone.set(phone, c);
    }
  }
  console.log(
    `  unique phones: ${byPhone.size}, invalid phones: ${invalidPhone}`,
  );

  // Look up existing users + cards.
  const allPhones = [...byPhone.keys()];

  const [existingContacts, existingCards] = await Promise.all([
    prisma.contactInformation.findMany({
      where: { phone: { in: allPhones } },
      select: { phone: true, userId: true },
    }),
    prisma.loyaltyCards.findMany({
      where: { phone: { in: allPhones } },
      select: { id: true, phone: true, userId: true },
    }),
  ]);
  const phoneToUser = new Map(existingContacts.map((c) => [c.phone, c.userId]));
  // Card's own userId trumps ContactInformation lookup — card may exist without contact row.
  for (const c of existingCards) {
    if (!phoneToUser.has(c.phone)) phoneToUser.set(c.phone, c.userId);
  }
  const phoneToCardId = new Map(existingCards.map((c) => [c.phone, c.id]));
  console.log(
    `  existing users (by phone): ${phoneToUser.size}, existing cards: ${phoneToCardId.size}`,
  );

  // Upsert users + cards. Keep stable id for existing cards; mint stub id for new ones.
  let createdStubs = 0;
  let updatedCards = 0;
  let createdCards = 0;
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

    const existingCardId = phoneToCardId.get(phone);
    const targetCardId = existingCardId ?? c.id;

    if (!DRY_RUN) {
      if (existingCardId) {
        await prisma.loyaltyCards.update({
          where: { id: existingCardId },
          data: {
            name: c.name,
            bonusBalance: c.bonusBalance,
            lastAccrualDate: parseDate(c.lastAccrualDate),
            allExpireBy: parseDate(c.allExpireBy),
          },
        });
      } else {
        await prisma.loyaltyCards.create({
          data: {
            id: c.id,
            name: c.name,
            phone,
            userId,
            bonusBalance: c.bonusBalance,
            lastAccrualDate: parseDate(c.lastAccrualDate),
            allExpireBy: parseDate(c.allExpireBy),
          },
        });
        phoneToCardId.set(phone, c.id);
      }
    }

    if (existingCardId) updatedCards++;
    else createdCards++;

    const total = updatedCards + createdCards;
    if (!DRY_RUN && total % 200 === 0) {
      console.log(`    cards ${total}/${cards.length}`);
    }
  }
  console.log(
    `  cards updated: ${updatedCards}, created: ${createdCards}, stub users: ${createdStubs}`,
  );

  // Movements: remap source cardId -> phone -> target cardId in Postgres.
  // Build deterministic id with index-within-(phone,date,type,amount) to handle dupes.
  type Prepared = {
    id: string;
    loyaltyCardId: string;
    date: Date;
    type: BonusMoveType;
    amount: number;
  };
  const groupCounter = new Map<string, number>();
  const prepared: Prepared[] = [];
  let orphaned = 0;
  for (const m of srcMovements as Array<SrcMovement & { phone: string }>) {
    const normPhone = normalizePhone(m.phone);
    if (!normPhone) {
      orphaned++;
      continue;
    }
    const targetCardId = phoneToCardId.get(normPhone);
    if (!targetCardId) {
      orphaned++;
      continue;
    }
    const groupKey = `${normPhone}|${m.date}|${m.type}|${m.amount}`;
    const idx = (groupCounter.get(groupKey) ?? 0) + 1;
    groupCounter.set(groupKey, idx);

    prepared.push({
      id: movementId(normPhone, m, idx),
      loyaltyCardId: targetCardId,
      date: new Date(m.date),
      type: m.type as BonusMoveType,
      amount: m.amount,
    });
  }
  console.log(`  movements valid: ${prepared.length}, orphaned: ${orphaned}`);

  if (DRY_RUN) {
    const sample = prepared.slice(0, 5000).map((m) => m.id);
    const found = await prisma.bonusMovements.findMany({
      where: { id: { in: sample } },
      select: { id: true },
    });
    const hitRate = sample.length ? found.length / sample.length : 0;
    const estExisting = Math.round(hitRate * prepared.length);
    console.log(
      `  movements (sample ${sample.length}): would insert new ~${prepared.length - estExisting}, skip dup ~${estExisting}`,
    );
    console.log('DRY RUN complete.');
    return;
  }

  const BATCH = 1000;
  let inserted = 0;
  for (let i = 0; i < prepared.length; i += BATCH) {
    const slice = prepared.slice(i, i + BATCH);
    const res = await prisma.bonusMovements.createMany({
      data: slice,
      skipDuplicates: true,
    });
    inserted += res.count;
    console.log(
      `    movements ${Math.min(i + BATCH, prepared.length)}/${prepared.length} (new: ${res.count})`,
    );
  }
  console.log(`  movements inserted (new): ${inserted}`);
  console.log('Update complete.');
}

main()
  .catch((e) => {
    console.error('Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
