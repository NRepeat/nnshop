/**
 * FIFO balance computation for loyalty cards.
 *
 * Each ACCRUAL becomes a "lot" expiring 1y after its date.
 * SPEND consumes oldest active lot first.
 * ADJUSTMENT >0 = new lot expiring 1y from now; <0 = consumes oldest active.
 * EXPIRY rows in DB are ignored — expiry is computed from lot date.
 * Future-dated movements are skipped.
 */

export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export interface BalanceMovement {
  date: Date;
  type: string;
  amount: number;
}

export function computeFifoBalance(movements: BalanceMovement[], now: Date = new Date()): number {
  type Lot = { expiry: Date; remaining: number };
  const lots: Lot[] = [];
  const sorted = [...movements].sort((a, b) => a.date.getTime() - b.date.getTime());

  for (const m of sorted) {
    if (m.date > now) continue;

    if (m.type === 'ACCRUAL') {
      lots.push({ expiry: new Date(m.date.getTime() + ONE_YEAR_MS), remaining: m.amount });
    } else if (m.type === 'ADJUSTMENT') {
      if (m.amount > 0) {
        lots.push({ expiry: new Date(now.getTime() + ONE_YEAR_MS), remaining: m.amount });
      } else {
        consumeFifo(lots, Math.abs(m.amount), m.date);
      }
    } else if (m.type === 'SPEND') {
      consumeFifo(lots, Math.abs(m.amount), m.date);
    }
    // EXPIRY rows ignored
  }

  // Apply expiry as of now
  for (const lot of lots) {
    if (lot.expiry <= now) lot.remaining = 0;
  }

  return Math.max(0, lots.reduce((s, l) => s + l.remaining, 0));
}

function consumeFifo(lots: { expiry: Date; remaining: number }[], amount: number, asOf: Date) {
  // Auto-burn lots expired before this consumption
  for (const lot of lots) {
    if (lot.expiry <= asOf) lot.remaining = 0;
  }
  let need = amount;
  for (const lot of lots) {
    if (need <= 0) break;
    if (lot.remaining <= 0) continue;
    const take = Math.min(lot.remaining, need);
    lot.remaining -= take;
    need -= take;
  }
}
