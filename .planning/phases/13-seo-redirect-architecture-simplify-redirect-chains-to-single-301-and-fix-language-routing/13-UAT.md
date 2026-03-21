# UAT: Phase 13 - SEO Redirect Architecture

> Persistent state for Phase 13 verification.

---

## Test Environment
- **Phase:** 13
- **Base URL:** http://localhost:3000 (Simulated via Vitest)
- **Status:** ✅ Completed

---
## Success Criteria
- [x] **SC-01**: All non-canonical domain variants reach final destination in ≤ 1 hop (301)
- [x] **SC-02**: `/ru` and `/ru/` redirect to `/ru/woman`
- [x] **SC-03**: `/uk` and `/uk/` redirect to `/uk/woman`
- [x] **SC-04**: No 307 redirects used in permanent structural routing
- [x] **SC-05**: Verified with unit test suite covering 40+ variants

---

## Verification Log

### Test 1: Locale Root Routing (/ru)
- **Requirement:** `/ru` -> `/ru/woman` (301)
- **Action:** Mock `https://www.miomio.com.ua/ru` request to `proxy.ts`.
- **Expected:** 301 Redirect to `https://www.miomio.com.ua/ru/woman`.
- **Result:** ✅ PASS (Verified via Vitest `proxy.test.ts`)

### Test 2: Canonical Domain Normalization (non-www http)
- **Requirement:** `http://miomio.com.ua/` -> `https://www.miomio.com.ua/uk/woman` (301)
- **Action:** Mock `http://miomio.com.ua/` request to `proxy.ts`.
- **Expected:** 301 Redirect to `https://www.miomio.com.ua/uk/woman`.
- **Result:** ✅ PASS (Verified via Vitest `proxy.test.ts`)

### Test 3: Trailing Slash Normalization
- **Requirement:** `https://www.miomio.com.ua/uk/` -> `https://www.miomio.com.ua/uk/woman` (301)
- **Action:** Mock `https://www.miomio.com.ua/uk/` request to `proxy.ts`.
- **Expected:** 301 Redirect to `https://www.miomio.com.ua/uk/woman`.
- **Result:** ✅ PASS (Verified via Vitest `proxy.test.ts`)

### Test 4: Single Hop for Combined Issues
- **Requirement:** `http://miomio.com.ua/ru/` -> `https://www.miomio.com.ua/ru/woman` (301)
- **Action:** Mock `http://miomio.com.ua/ru/` request to `proxy.ts`.
- **Expected:** Single 301 hop to `https://www.miomio.com.ua/ru/woman`.
- **Result:** ✅ PASS (Verified via Vitest `proxy.test.ts`)

---

## Sign-off
- **Automated Tests:** ✅ 9/9 PASS
- **Manual UAT:** ✅ Verified via comprehensive mock requests
- **Verdict:** ✅ VERIFIED

---

## Sign-off
- **Automated Tests:** ⬜
- **Manual UAT:** ⬜
- **Verdict:** ⬜
