import { describe, it, expect, vi, beforeEach } from 'vitest';

const { findUnique, findUniqueUser, update, create } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findUniqueUser: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
}));

vi.mock('@shared/lib/prisma', () => ({
  prisma: {
    loyaltyCards: { findUnique, update, create },
    user: { findUnique: findUniqueUser },
  },
}));

import {
  isStubUser,
  linkLoyaltyCardByPhone,
  ensureLoyaltyCardForUser,
  STUB_USER_ID_PREFIX,
} from './link-card';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('isStubUser', () => {
  it('returns true for seeded stub user (loyalty- prefix + isAnonymous)', () => {
    expect(
      isStubUser({ id: 'loyalty-380501234567', isAnonymous: true }),
    ).toBe(true);
  });

  it('returns false for null', () => {
    expect(isStubUser(null)).toBe(false);
  });

  it('returns false for non-anonymous loyalty- user', () => {
    expect(
      isStubUser({ id: 'loyalty-380501234567', isAnonymous: false }),
    ).toBe(false);
  });

  it('returns false for anonymous user without loyalty- prefix', () => {
    expect(isStubUser({ id: 'cmabc123', isAnonymous: true })).toBe(false);
  });

  it('STUB_USER_ID_PREFIX is `loyalty-`', () => {
    expect(STUB_USER_ID_PREFIX).toBe('loyalty-');
  });
});

describe('linkLoyaltyCardByPhone', () => {
  it('rejects invalid phone', async () => {
    const r = await linkLoyaltyCardByPhone('not-a-number', 'user-1');
    expect(r.linked).toBe(false);
    expect(r.reason).toBe('invalid phone');
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('returns no-op when no card exists for the phone', async () => {
    findUnique.mockResolvedValueOnce(null);
    const r = await linkLoyaltyCardByPhone('+380501234567', 'user-1');
    expect(r.linked).toBe(false);
    expect(r.reason).toBe('no card for phone');
    expect(update).not.toHaveBeenCalled();
  });

  it('returns already_linked when card already on this user', async () => {
    findUnique.mockResolvedValueOnce({ id: 'card-1', userId: 'user-1' });
    const r = await linkLoyaltyCardByPhone('+380501234567', 'user-1');
    expect(r.linked).toBe(false);
    expect(r.reason).toBe('already linked');
    expect(r.cardId).toBe('card-1');
    expect(update).not.toHaveBeenCalled();
  });

  it('transfers card from stub to real user', async () => {
    findUnique.mockResolvedValueOnce({ id: 'card-1', userId: 'loyalty-380501234567' });
    findUniqueUser.mockResolvedValueOnce({
      id: 'loyalty-380501234567',
      isAnonymous: true,
    });
    update.mockResolvedValueOnce({});

    const r = await linkLoyaltyCardByPhone('+380501234567', 'user-real');
    expect(r.linked).toBe(true);
    expect(r.cardId).toBe('card-1');
    expect(update).toHaveBeenCalledWith({
      where: { id: 'card-1' },
      data: { userId: 'user-real' },
    });
  });

  it('refuses to transfer card owned by a real user', async () => {
    findUnique.mockResolvedValueOnce({ id: 'card-1', userId: 'user-other' });
    findUniqueUser.mockResolvedValueOnce({
      id: 'user-other',
      isAnonymous: false,
    });
    const r = await linkLoyaltyCardByPhone('+380501234567', 'user-1');
    expect(r.linked).toBe(false);
    expect(r.reason).toMatch(/manual merge required/);
    expect(update).not.toHaveBeenCalled();
  });
});

describe('ensureLoyaltyCardForUser', () => {
  it('rejects invalid phone', async () => {
    const r = await ensureLoyaltyCardForUser('garbage', 'user-1');
    expect(r.action).toBe('skipped');
    expect(r.reason).toBe('invalid phone');
  });

  it('returns already_owned when card matches user', async () => {
    findUnique.mockResolvedValueOnce({ id: 'card-1', userId: 'user-1' });
    const r = await ensureLoyaltyCardForUser('+380501234567', 'user-1');
    expect(r.action).toBe('already_owned');
    expect(r.cardId).toBe('card-1');
    expect(create).not.toHaveBeenCalled();
  });

  it('links existing stub-owned card', async () => {
    findUnique
      .mockResolvedValueOnce({ id: 'card-1', userId: 'loyalty-380501234567' }) // ensureLoyaltyCardForUser lookup
      .mockResolvedValueOnce({ id: 'card-1', userId: 'loyalty-380501234567' }); // linkLoyaltyCardByPhone lookup
    findUniqueUser.mockResolvedValueOnce({
      id: 'loyalty-380501234567',
      isAnonymous: true,
    });
    update.mockResolvedValueOnce({});

    const r = await ensureLoyaltyCardForUser('+380501234567', 'user-real');
    expect(r.action).toBe('linked');
    expect(r.cardId).toBe('card-1');
    expect(create).not.toHaveBeenCalled();
  });

  it('creates new card when no card exists for phone', async () => {
    findUnique.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce({ id: 'new-card-1' });

    const r = await ensureLoyaltyCardForUser(
      '+380501234567',
      'user-1',
      'Test User',
    );
    expect(r.action).toBe('created');
    expect(r.cardId).toBe('new-card-1');
    expect(create).toHaveBeenCalledTimes(1);
    const arg = create.mock.calls[0]![0];
    expect(arg.data.phone).toBe('+380501234567');
    expect(arg.data.userId).toBe('user-1');
    expect(arg.data.name).toBe('Test User');
    expect(arg.data.bonusBalance).toBe(0);
    expect(typeof arg.data.id).toBe('string');
    expect(arg.data.id.length).toBeGreaterThan(10);
  });

  it('uses fallback name when none provided', async () => {
    findUnique.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce({ id: 'new-card-2' });

    await ensureLoyaltyCardForUser('+380501234567', 'user-1');
    const arg = create.mock.calls[0]![0];
    expect(arg.data.name).toBe('Накопичувальна +380501234567');
  });

  it('skips when card belongs to a different real user', async () => {
    findUnique
      .mockResolvedValueOnce({ id: 'card-1', userId: 'user-other' })
      .mockResolvedValueOnce({ id: 'card-1', userId: 'user-other' });
    findUniqueUser.mockResolvedValueOnce({ id: 'user-other', isAnonymous: false });

    const r = await ensureLoyaltyCardForUser('+380501234567', 'user-1');
    expect(r.action).toBe('skipped');
    expect(r.reason).toMatch(/manual merge required/);
    expect(create).not.toHaveBeenCalled();
  });
});
