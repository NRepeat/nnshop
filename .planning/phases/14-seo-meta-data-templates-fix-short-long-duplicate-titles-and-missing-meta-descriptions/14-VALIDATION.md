---
phase: 14-seo-meta-data-templates-fix-short-long-duplicate-titles-and-missing-meta-descriptions
slug: seo-meta-data-templates
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-21
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | manual / vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | < 1 minute |

---

## Sampling Rate

- **After Task 1:** Manual code inspection and character count check on templates.
- **After Task 2:** Manual check of info page metadata.
- **Before finalization:** Full project build check.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 14-01-01 | 01 | 1 | Dynamic Templates | manual | `grep "generate" src/shared/lib/seo/generateMetadata.ts` | ✅ | ⬜ pending |
| 14-01-02 | 01 | 1 | Info Metadata | manual | `grep "seoTitles" app/[locale]/(frontend)/info/[slug]/page.tsx` | ✅ | ⬜ pending |
| 14-01-03 | 01 | 1 | Head Placement | automated | `grep "htmlLimitedBots" next.config.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Title Length | 30-60 chars | Template-based | Inspect generated titles in a variety of locales. |
| Desc Length | >= 70 chars | Template-based | Inspect generated descriptions. |
| Title != H1 | Unique SEO titles | Visual check | Confirm H1 title differs from <title> tag. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
