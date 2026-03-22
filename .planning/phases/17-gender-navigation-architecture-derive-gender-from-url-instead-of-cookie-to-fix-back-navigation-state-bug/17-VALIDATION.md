---
phase: 17
slug: gender-navigation-architecture-derive-gender-from-url-instead-of-cookie-to-fix-back-navigation-state-bug
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-21
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Static Analysis / E2E (Grep) |
| **Config file** | N/A |
| **Quick run command** | `grep -r "cookie" src | grep "gender" || true` |
| **Full suite command** | `./scripts/verify-phase-17.sh` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run grep checks for removed cookie logic
- **Before /gsd:verify-work:** All components must derive gender from URL
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 17-01-01 | 01 | 1 | SEO-17-01 | static | `grep -r "gender" proxy.ts | grep "cookie" \|\| true` | ✅ | ⬜ pending |
| 17-01-02 | 01 | 1 | SEO-17-02 | static | `grep -r "cookies()" src/features/header/ui/LogoLink.tsx \|\| true` | ✅ | ⬜ pending |
| 17-01-03 | 01 | 1 | SEO-17-02 | static | `grep -r "document.cookie" src/features/header/navigation/ui/NavButton.tsx \|\| true` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Back-navigation sync | SEO-17-01 | Navigation state | Navigate Woman -> Man -> Back. Verify breadcrumbs and content match Woman context. |
| Cookie absence | SEO-17-01 | Runtime check | Clear cookies, navigate. Verify no 'gender' cookie is set in Application tab. |

---

## Validation Sign-Off

- [x] All tasks have <automated> verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
