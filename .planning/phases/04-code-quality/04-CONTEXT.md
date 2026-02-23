# Phase 4: Code Quality - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Eliminate unsafe type casts (`as any`, `Record<string, any>`) in specific identified files, and fix memory leaks (missing `removeEventListener` cleanup, uncleared `setTimeout` refs) in the named components. No new quality sweeps beyond the listed targets.

</domain>

<decisions>
## Implementation Decisions

### `as any` replacement approach
- For UI files (UkrPoshtaForm, HeroPageBuilder, AnnouncementBar): derive the replacement type from existing Zod schemas or Sanity-generated types — no new interfaces where an existing definition already describes the shape
- For cart buyer identity and session extension code: define inline named interfaces directly above the function/variable that uses them; do not extract to a separate types file
- New interfaces/types are **not exported** — they remain private to the file unless already needed elsewhere

### Promise.allSettled in auth.ts
- **Skip entirely** — Phase 2 Plan 02-03 already fixed this; Phase 4 does not re-address it

### Memory leak fix scope
- Fix **only** the named components from the success criteria: NovaPoshtaButton, QuickBuyModal, LanguageSwitcher, SyncedCarousels, and the addEventListener-using components in criteria #4
- Do not sweep the rest of the codebase for the same patterns

### addEventListener cleanup approach
- **Minimal**: add `removeEventListener` in the `useEffect` return function only
- Do not refactor to `useCallback` unless the handler reference is demonstrably unstable and cleanup fails without it

### setTimeout ref approach
- **Replace** any existing `let timeoutId` local variables with `useRef<ReturnType<typeof setTimeout> | null>(null)` — the ref stores the ID, cleanup calls `clearTimeout(ref.current)` in the `useEffect` return

### TypeScript acceptance gate
- Verify under **current tsconfig config** — do not add `strict: true` project-wide
- Final acceptance: `npm run build` passes with zero TypeScript errors
- Do **not** run `npm run lint` or `npm run format:check` as a phase gate

### Claude's Discretion
- Which specific Zod schema or Sanity type to use for each `as any` replacement (researcher will identify these)
- Whether to use `type` alias or `interface` for new named types
- Exact ref initialization pattern if edge cases arise

</decisions>

<specifics>
## Specific Ideas

- The key constraint on types: avoid creating new definitions when an existing Zod/Sanity type already describes the shape — keep types DRY
- setTimeout pattern: `const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)` → `timerRef.current = setTimeout(...)` → cleanup: `if (timerRef.current) clearTimeout(timerRef.current)`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-code-quality*
*Context gathered: 2026-02-23*
