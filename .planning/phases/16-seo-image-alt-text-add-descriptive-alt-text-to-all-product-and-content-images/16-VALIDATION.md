---
phase: 16
slug: seo-image-alt-text-add-descriptive-alt-text-to-all-product-and-content-images
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test src/shared/lib/seo/getImageAlt.test.ts` |
| **Full suite command** | `npm test src/shared/lib/seo/getImageAlt.test.ts` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test src/shared/lib/seo/getImageAlt.test.ts`
- **After every plan wave:** Run `npm test`
- **Before /gsd:verify-work:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 16-01-01 | 01 | 1 | SEO-16-01 | unit | `npm test src/shared/lib/seo/getImageAlt.test.ts` | ❌ W0 | ⬜ pending |
| 16-01-02 | 01 | 1 | SEO-16-02 | integration | `grep -n "alt" src/shared/sanity/components/portableText/image.tsx` | ✅ | ⬜ pending |
| 16-01-03 | 01 | 1 | SEO-16-03 | integration | `grep -E "getProductAlt" src/entities/product/ui/ProductCard.tsx` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/shared/lib/seo/getImageAlt.test.ts` — stubs for alt text generation logic
- [ ] `src/shared/lib/seo/getImageAlt.ts` — utility shell

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sanity Studio validation | SEO-16-02 | CMS UI | Open Sanity Studio, verify 'alt' field is present and has warning/validation in UI. |
| Visual Check (Product) | SEO-16-01 | Rendering | Inspect product image in browser, verify 'alt' text matches expected pattern. |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [x] All tasks have <automated> verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
