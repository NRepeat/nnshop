---
phase: 15-seo-schema-markup-add-onlinestore-website-searchaction-itemlist-shipping-and-return-policy-schemas
slug: seo-schema-markup
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-21
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test src/shared/lib/tests/schema.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | < 10s |

---

## Sampling Rate

- **After Task 1:** Automated grep verification of exports.
- **After Task 2:** Automated grep verification of integration.
- **Before finalization:** Full Vitest suite for schema validation.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 1 | Schema Generators | automated | `grep -E "generateWebSiteJsonLd|generateItemListJsonLd|generateWebPageJsonLd" src/shared/lib/seo/jsonld/index.ts` | ✅ | ⬜ pending |
| 15-01-02 | 01 | 1 | UI Integration | automated | `grep -E "generateWebSiteJsonLd|generateItemListJsonLd|generateWebPageJsonLd" app/[locale]/(frontend)/layout.tsx src/features/collection/ui/CollectionGrid.tsx app/[locale]/(frontend)/info/\[slug\]/page.tsx` | ✅ | ⬜ pending |
| 15-01-03 | 01 | 1 | Schema Correctness | automated | `npm test src/shared/lib/tests/schema.test.ts` | ❌ (Task creates) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google Rich Results | SearchAction / ItemList | Requires live URL / public exposure | Copy rendered JSON-LD from page source and paste into Google Rich Results Test tool. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
