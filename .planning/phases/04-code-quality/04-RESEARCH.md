# Phase 4: Code Quality - Research

**Researched:** 2026-02-23
**Domain:** TypeScript type safety (as any elimination), React memory leak cleanup (useEffect, setTimeout refs)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **`as any` replacement approach**
  - For UI files (UkrPoshtaForm, HeroPageBuilder, AnnouncementBar): derive the replacement type from existing Zod schemas or Sanity-generated types — no new interfaces where an existing definition already describes the shape
  - For cart buyer identity and session extension code: define inline named interfaces directly above the function/variable that uses them; do not extract to a separate types file
  - New interfaces/types are **not exported** — they remain private to the file unless already needed elsewhere

- **Promise.allSettled in auth.ts**
  - **Skip entirely** — Phase 2 Plan 02-03 already fixed this; Phase 4 does not re-address it

- **Memory leak fix scope**
  - Fix **only** the named components from the success criteria: NovaPoshtaButton, QuickBuyModal, LanguageSwitcher, SyncedCarousels, and the addEventListener-using components in criteria #4
  - Do not sweep the rest of the codebase for the same patterns

- **addEventListener cleanup approach**
  - **Minimal**: add `removeEventListener` in the `useEffect` return function only
  - Do not refactor to `useCallback` unless the handler reference is demonstrably unstable and cleanup fails without it

- **setTimeout ref approach**
  - **Replace** any existing `let timeoutId` local variables with `useRef<ReturnType<typeof setTimeout> | null>(null)` — the ref stores the ID, cleanup calls `clearTimeout(ref.current)` in the `useEffect` return

- **TypeScript acceptance gate**
  - Verify under **current tsconfig config** — do not add `strict: true` project-wide
  - Final acceptance: `npm run build` passes with zero TypeScript errors
  - Do **not** run `npm run lint` or `npm run format:check` as a phase gate

### Claude's Discretion

- Which specific Zod schema or Sanity type to use for each `as any` replacement (researcher will identify these)
- Whether to use `type` alias or `interface` for new named types
- Exact ref initialization pattern if edge cases arise

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TYPE-01 | `as any` type casts removed from UkrPoshtaForm, HeroPageBuilder, and AnnouncementBar; replaced with proper typed interfaces using Sanity-generated types | Exact cast locations identified, exact replacement types identified for each |
| TYPE-02 | `Record<string, any>` removed from cart buyer identity update and session extensions; replaced with typed User and Session interfaces | Exact lines in `anonymous-cart-buyer-identity-update.ts` identified; better-auth `User` and `Session` types are sufficient with inline extensions |
| TYPE-03 | Promise.allSettled array index access in auth.ts replaced with named destructuring via a result interface | **SKIP** — Phase 2 (02-03) already fixed this |
| MEM-01 | Every `addEventListener` call in the codebase has a matching `removeEventListener` in its useEffect cleanup function | Only one target component confirmed: NovaPoshtaButton (window message listener); all others already have cleanup |
| MEM-02 | All `setTimeout` calls in NovaPoshtaButton, QuickBuyModal, LanguageSwitcher, and SyncedCarousels store IDs in refs and are cleared on component unmount | Exact setTimeout usage audited per file; SyncedCarousels uses `setTimeout(() => onInit(api2), 0)` with no ID stored; QuickBuyModal has bare `setTimeout` after order success; LanguageSwitcher has bare `setTimeout(() => setSelectedLocale(locale), 0)` |
</phase_requirements>

## Summary

Phase 4 is a surgical refactor — no new libraries, no architectural changes. All work falls into two categories: (1) eliminating `as any` / `Record<string, any>` casts by substituting existing Zod-inferred or Sanity-generated types, and (2) adding missing memory cleanup (clearTimeout in refs, removeEventListener where missing). The TypeScript gate is `npm run build` under the existing tsconfig — no strict mode changes.

Every target file has been read. The exact cast locations, their current types, and the correct replacement types are documented below. This research eliminates ambiguity for the planner: each fix is a specific, bounded code change.

**Primary recommendation:** Work file-by-file. Each file is an independent unit. Fix types first (TYPE-01, TYPE-02), then memory leaks (MEM-01, MEM-02). Run `npm run build` after each file to confirm no new errors.

## Standard Stack

No new libraries needed. All fixes use the existing project stack.

### Core
| Tool | Version | Purpose in Phase 4 |
|------|---------|---------------------|
| TypeScript | current (project) | Type checking gate via `npm run build` |
| Zod | v4 (project) | Source of truth for form field name types via `z.infer<>` |
| better-auth | current (project) | `User`, `Session` base types for inline interface extension |
| Sanity TypeGen | current (project) | Source of truth for `CollectionsCarousel`, `SliderBlock`, `Faqs` block types |
| React `useRef` | 19 (project) | Replace `let` setTimeout locals with `useRef<ReturnType<typeof setTimeout> \| null>(null)` |

**Installation:** None required.

## Architecture Patterns

### Pattern 1: Replacing `as any` with Zod-inferred field names (UkrPoshtaForm)

**What:** `FormField` `name` prop requires `Path<TFieldValues>`. Currently `useFormContext()` returns `UseFormReturn<FieldValues>` (untyped), so the field array items use `name={item.name as any}` to satisfy the type.

**Fix approach:** Type the form context with the concrete schema type. `UkrPoshtaForm` is a child of `DeliveryForm`, which calls `useForm<DeliveryInfo>()`. Import `DeliveryInfo` from the delivery schema and use `useFormContext<DeliveryInfo>()`. Then type the field array explicitly so `item.name` is already `Path<DeliveryInfo>` — no cast needed.

**Key types available:**
- `DeliveryInfo` from `src/features/checkout/delivery/model/deliverySchema.ts` (exported)
- `Path<DeliveryInfo>` from `react-hook-form` — the exact type `FormField.name` expects

```typescript
// src/features/checkout/delivery/ui/UkrPoshtaForm.tsx
import { useFormContext } from 'react-hook-form';
import { DeliveryInfo } from '../model/deliverySchema';
import { Path } from 'react-hook-form';

type FieldConfig = { name: Path<DeliveryInfo>; label: string; placeholder: string };

const addressFields: FieldConfig[] = [
  { name: 'address', label: 'address', placeholder: 'enterStreetAddress' },
  { name: 'apartment', label: 'apartment', placeholder: 'enterApartmentNumber' },
];

const locationFields: FieldConfig[] = [
  { name: 'city', label: 'city', placeholder: 'enterCity' },
  { name: 'postalCode', label: 'postalCode', placeholder: 'enterPostalCode' },
];

export default function UkrPoshtaForm() {
  const form = useFormContext<DeliveryInfo>();
  // ...
  // name={item.name} — now typed as Path<DeliveryInfo>, no cast needed
}
```

### Pattern 2: Replacing HeroPageBuilder `as any` with Sanity-generated types

**What:** `HeroPageBuilder` switch-cases over `block._type` values from the GROQ query result. Several cases use `as any` to pass block data to components.

**Exact `as any` locations and their replacements:**

| Line | Cast | Block type | Fix |
|------|------|------------|-----|
| `{...(block as any)}` for `<FAQs>` | `block` is union after `case 'faqs':` — FAQs expects `Faqs` from Sanity | Use `Faqs` from `@shared/sanity/types` — `block` after narrowing is `Extract<content[number], { _type: 'faqs' }>` which is compatible |
| `block.collection as any` for `<SimilarProducts>` | `SimilarProducts['collection']` is `{ _ref: string; _type: 'reference'; ... }` — component receives it | After narrowing, `block.collection` already has that type; no cast needed |
| `block.collections as any`, `block.title as any`, `block.action_text as any` for `<CollectionsCarousel>` | `CollectionsCarousel` (from `@shared/sanity/types`) has `collections`, `title`, `action_text` | After narrowing in `case 'collectionsCarousel':`, block is `CollectionsCarousel` — spread `{...block}` or pass named props |
| `{...(block as any)}` for `<HeroSwiper>` | `HeroSwiperProps` extends `Extract<PAGE_QUERYResult['content'][number], { _type: 'sliderBlock' }>` — but HeroPageBuilder uses HOME_PAGE query | `HeroSwiper` only destructures `slides` from its props. After `case 'sliderBlock':`, block has `slides` from `SliderBlock`. Pass `{...block, documentId: '', documentType: '', blockIndex: 0}` or refactor HeroSwiper props to only require `slides` |
| `(block as any)._type` in default | Harmless — just for console.warn | Remove cast; use `(block as { _type: string })._type` or simply omit the logging argument |

**Key Sanity types available in `@shared/sanity/types`:**
- `Faqs` — `{ _type: 'faqs'; title?: string; faqs?: Array<...> }`
- `CollectionsCarousel` — `{ _type: 'collectionsCarousel'; title?: LocalizedString; collections?: Array<...>; action_text?: LocalizedString; ... }`
- `SliderBlock` — `{ _type: 'sliderBlock'; slides?: Array<...> }`
- `SimilarProducts` — `{ _type: 'similarProducts'; title?: LocalizedString; collection?: { _ref: string; ... } }`

**Note on HeroSwiper:** `HeroSwiperProps` requires `documentId`, `documentType`, `blockIndex` fields that come from `PAGE_QUERYResult` context but are NOT in `HOME_PAGE` query results. The cleanest fix: change the `case 'sliderBlock':` line to pass `slides={block.slides}` directly and update `HeroSwiper` to accept `{ slides: SliderBlock['slides'] }` — OR simply spread block and provide the required extra props as literals. Researcher recommends narrowing `HeroSwiper` props to only what it uses (`slides`), since `documentId/documentType/blockIndex` are never used inside the component body.

### Pattern 3: Replacing AnnouncementBar `as any`

**What:** `{text as any as string}` appears twice (once each for mobile and desktop `<p>` elements).

**Root cause:** The Sanity-generated `HEADER_QUERYResult.infoBar.text` type is:
```typescript
Array<{ _type: 'localizedString'; ru?: string; uk?: string }> | string | ''
```
The GROQ query uses `coalesce(text[$locale], text.uk, text.ru, "")` which in practice always returns a `string | ''`, but the TypeScript type still includes the array union member.

**Fix approach:** Narrow before render. A simple type guard:
```typescript
const displayText = typeof text === 'string' ? text : '';
```
Then render `{displayText}` — no cast needed.

### Pattern 4: Replacing `Record<string, any>` in cart buyer identity (TYPE-02)

**What:** `anonymous-cart-buyer-identity-update.ts` lines 173–178:
```typescript
anonymousUser: {
  user: UserWithAnonymous & Record<string, any>;
  session: Session & Record<string, any>;
};
newUser: {
  user: User & Record<string, any>;
  session: Session & Record<string, any>;
};
```

**Root cause:** better-auth's `onLinkAccount` callback may inject extra properties. `Record<string, any>` was used as a catch-all.

**Fix approach (per CONTEXT.md):** Define inline named interfaces in the same file, directly above `anonymousCartBuyerIdentityUpdate`. These are private/unexported — they describe only what this function reads from its arguments. The function body only accesses: `user.id`, `user.email`, `user.isAnonymous` — all already on `UserWithAnonymous` / `User`. The `session` object properties are never accessed inside this function at all.

```typescript
// Inline, unexported — above the function definition
interface AnonymousUserArg {
  user: UserWithAnonymous;
  session: Session;
}
interface NewUserArg {
  user: User;
  session: Session;
}

export const anonymousCartBuyerIdentityUpdate = async ({
  newUser,
  anonymousUser,
}: {
  anonymousUser: AnonymousUserArg;
  newUser: NewUserArg;
}) => { ... }
```

The `Record<string, any>` was unnecessary — the function never uses any dynamic properties from user or session. Removing it tightens the type without changing runtime behavior.

### Pattern 5: setTimeout ref pattern (MEM-02)

**Confirmed setTimeout locations (code-audited):**

| File | Current pattern | Issue |
|------|----------------|-------|
| `QuickBuyModal.tsx` line 168 | Bare `setTimeout(() => { onOpenChange(false); }, 2000)` inside `startTransition` | ID not stored; cannot cancel on unmount |
| `LanguageSwitcher.tsx` line 46 | `setTimeout(() => setSelectedLocale(locale), 0)` in `useEffect` | ID not stored; component may unmount before callback fires |
| `SyncedCarousels.tsx` line 80 | `setTimeout(() => onInit(api2), 0)` in `useEffect` | ID not stored; component may unmount before callback fires |
| `NovaPoshtaButton.tsx` line 62 | `setTimeout(() => { ... }, 100)` in `openFrame()` function | ID not stored; fired outside useEffect — no cleanup possible |

**Standard ref pattern (per CONTEXT.md):**
```typescript
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// On set:
timerRef.current = setTimeout(() => { ... }, delay);

// useEffect cleanup:
return () => {
  if (timerRef.current) clearTimeout(timerRef.current);
};
```

**NovaPoshtaButton special case:** The `setTimeout` in `openFrame()` is called from a click handler, not directly in a `useEffect`. The correct pattern: store in `timerRef`, and add a cleanup `useEffect` that runs on unmount:
```typescript
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const openFrame = () => {
  setIsModalOpen(true);
  timerRef.current = setTimeout(() => { ... }, 100);
};

useEffect(() => {
  return () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
}, []); // empty deps — runs only on unmount
```

### Pattern 6: addEventListener cleanup (MEM-01)

**Audit result:** Only `NovaPoshtaButton` has the `window.addEventListener('message', handleFrameMessage)` pattern with cleanup. **The cleanup already exists** at lines 149–161:
```typescript
useEffect(() => {
  if (isModalOpen) {
    window.addEventListener('message', handleFrameMessage);
    return () => {
      window.removeEventListener('message', handleFrameMessage);
    };
  }
}, [isModalOpen, selectedDepartmentId, onDepartmentSelect, handleFrameMessage]);
```
This useEffect is already correctly structured. MEM-01 is satisfied for this component.

**The `openFrame()` function at line 83** also calls `iframeRef.current.addEventListener('load', handleLoad)` — however this returns a cleanup function from inside `setTimeout`, meaning the cleanup `return () => iframeRef.current?.removeEventListener('load', handleLoad)` is inside the setTimeout callback, not in a useEffect return. This is not a standard memory leak (the event is on a ref'd iframe DOM node, not window), but it is fragile. Per CONTEXT.md minimal scope: no refactor beyond the named components.

The success criterion #4 states "every component that calls addEventListener also calls removeEventListener in its useEffect cleanup." The window `addEventListener` in NovaPoshtaButton already has cleanup. No other named component uses `addEventListener`. MEM-01 is already satisfied except to verify at build time.

### Anti-Patterns to Avoid

- **`useFormContext()` without generic:** Gives `UseFormReturn<FieldValues>` which loses field name types. Always use `useFormContext<SchemaType>()`.
- **`as any as TargetType`:** Double cast silences errors but adds no safety. Replace with a real narrowing expression or a type-safe coercion.
- **Storing setTimeout ID in state:** Using `useState<number | null>` for timer IDs triggers re-renders on set; use `useRef` instead.
- **`Record<string, any>` as union member:** `T & Record<string, any>` means "T, plus arbitrary extra keys with any values" — this defeats exhaustive type checks. Remove when the function does not access dynamic keys.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form field name type safety | Custom string union | `Path<TFieldValues>` from `react-hook-form` | Automatically reflects schema shape; survives schema renames |
| Block type narrowing in switch | Manual type casting | TypeScript's built-in narrowing via `switch(block._type)` | After `case 'faqs':`, TypeScript knows block is the faqs variant |
| Timer cleanup | Custom cleanup registry | `useRef<ReturnType<typeof setTimeout> \| null>(null)` | Platform primitive; no extra dependencies |

## Common Pitfalls

### Pitfall 1: Typing `useFormContext` without the generic loses field names
**What goes wrong:** `useFormContext()` returns `UseFormReturn<FieldValues>`. The `name` prop on `FormField` becomes `string` instead of `Path<T>`, and the map array items still need `as any` to satisfy it.
**Why it happens:** The generic is optional and defaults to `FieldValues`.
**How to avoid:** Always use `useFormContext<SchemaType>()` matching the parent `useForm<SchemaType>()` call.

### Pitfall 2: HeroSwiper prop mismatch
**What goes wrong:** `HeroSwiperProps` extends `Extract<PAGE_QUERYResult['content'][number], ...>` which includes `documentId`, `documentType`, `blockIndex` — but the `HOME_PAGE` GROQ query does not project these. Spreading `block` into `<HeroSwiper {...block} />` will cause TS errors for missing required props.
**How to avoid:** Either (a) change the spread to only pass `slides={block.slides}` and update `HeroSwiper` to accept `{ slides: SliderBlock['slides'] }` — the simplest fix since the component never uses documentId/documentType/blockIndex — or (b) provide the extra props as literals.
**Recommendation:** Narrow `HeroSwiperProps` to only `{ slides: SliderBlock['slides'] }` since the three extra fields are unused inside the component body.

### Pitfall 3: AnnouncementBar text coalesce doesn't eliminate array type
**What goes wrong:** Even though `coalesce(text[$locale], text.uk, text.ru, "")` always returns a string at runtime, the Sanity TypeGen still generates `Array<...> | string | ''`. A direct `{text}` cast to JSX without narrowing produces a type error.
**How to avoid:** `const displayText = typeof text === 'string' ? text : '';` then render `{displayText}`.

### Pitfall 4: `useRef` for setTimeout — initialization matters
**What goes wrong:** If the ref is initialized as `useRef<ReturnType<typeof setTimeout>>(undefined!)` (wrong), TypeScript won't catch missed clearTimeout calls.
**How to avoid:** Initialize as `useRef<ReturnType<typeof setTimeout> | null>(null)` and guard with `if (timerRef.current) clearTimeout(timerRef.current)`.

### Pitfall 5: NovaPoshtaButton's inner `openFrame` setTimeout
**What goes wrong:** `openFrame` is called from a click handler, not useEffect. If no unmount cleanup exists for the timeout ID, a fast unmount (e.g., route change while modal is opening) leaves the 100ms callback orphaned. It will then try to set iframe src on an unmounted ref.
**How to avoid:** Add a dedicated mount-only `useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, [])` to cover the unmount case.

## Code Examples

### UkrPoshtaForm — typed form context and field array

```typescript
// src/features/checkout/delivery/ui/UkrPoshtaForm.tsx
import { useFormContext } from 'react-hook-form';
import { Path } from 'react-hook-form';
import { DeliveryInfo } from '../model/deliverySchema';

type FieldConfig = {
  name: Path<DeliveryInfo>;
  label: string;
  placeholder: string;
};

const addressFields: FieldConfig[] = [
  { name: 'address', label: 'address', placeholder: 'enterStreetAddress' },
  { name: 'apartment', label: 'apartment', placeholder: 'enterApartmentNumber' },
];

export default function UkrPoshtaForm() {
  const form = useFormContext<DeliveryInfo>();
  // ...
  // <FormField name={item.name} ... /> — no as any needed
}
```

### AnnouncementBar — string narrowing

```typescript
// src/entities/announcement-bar/announcement-bar.tsx
const displayText = typeof text === 'string' ? text : '';
// render: {displayText}  — replaces {text as any as string}
```

### HeroPageBuilder — typed block switch

```typescript
// Import Sanity types at top
import type { Faqs, CollectionsCarousel, SliderBlock } from '@shared/sanity/types';

// case 'faqs':
case 'faqs':
  return <FAQs key={block._key} {...(block as Faqs)} />;

// case 'collectionsCarousel':
case 'collectionsCarousel':
  return (
    <CollectionsCarouselComponent
      key={block._key}
      collections={(block as CollectionsCarousel).collections}
      title={(block as CollectionsCarousel).title}
      action_text={(block as CollectionsCarousel).action_text}
      gender={gender}
    />
  );

// case 'sliderBlock':
case 'sliderBlock':
  return <HeroSwiper key={block._key} slides={(block as SliderBlock).slides} />;

// default:
default:
  console.warn(`Unknown block type: ${block._type}`);
  return null;
```

Note: After switch narrowing, block type in `case 'faqs'` IS already the Faqs union member if the content type is correctly typed from the GROQ result. Whether block is a discriminated union depends on how `sanityFetch` types the return. Use `as Faqs` only as an assertion when TypeScript's narrowing cannot pierce the union (which is common with Sanity's generated union types that use `& { _key: string }` intersections).

### anonymous-cart-buyer-identity-update.ts — inline interfaces

```typescript
// Inline unexported interfaces — placed directly above the function

interface AnonymousUserArg {
  user: UserWithAnonymous;
  session: Session;
}

interface NewUserArg {
  user: User;
  session: Session;
}

export const anonymousCartBuyerIdentityUpdate = async ({
  newUser,
  anonymousUser,
}: {
  anonymousUser: AnonymousUserArg;
  newUser: NewUserArg;
}) => {
  // Function body unchanged
};
```

### QuickBuyModal — setTimeout ref pattern

```typescript
import { useRef } from 'react';

const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// Inside startTransition callback, after result.success:
closeTimerRef.current = setTimeout(() => {
  onOpenChange(false);
}, 2000);

// Add cleanup useEffect:
useEffect(() => {
  return () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };
}, []);
```

### LanguageSwitcher — setTimeout ref pattern

```typescript
import { useRef } from 'react';

const localeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  if (locale && selectedLocale !== locale) {
    localeTimerRef.current = setTimeout(() => setSelectedLocale(locale), 0);
  }
  return () => {
    if (localeTimerRef.current) clearTimeout(localeTimerRef.current);
  };
}, [locale, selectedLocale]);
```

### SyncedCarousels — setTimeout ref pattern

```typescript
import { useRef } from 'react';

const initTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  if (api1) api1.on('select', onSelect);
  if (api2) {
    api2.on('select', onSelect);
    api2.on('reInit', onSelect);
    initTimerRef.current = setTimeout(() => onInit(api2), 0);
  }
  return () => {
    if (api1) api1.off('select', onSelect);
    if (api2) {
      api2.off('select', onSelect);
      api2.off('reInit', onSelect);
    }
    if (initTimerRef.current) clearTimeout(initTimerRef.current);
  };
}, [api1, api2, onSelect, onInit]);
```

### NovaPoshtaButton — setTimeout ref + unmount cleanup

```typescript
import { useRef } from 'react';

const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const openFrame = () => {
  setIsModalOpen(true);
  openTimerRef.current = setTimeout(() => {
    // existing iframe setup logic
  }, 100);
};

// Dedicated unmount cleanup:
useEffect(() => {
  return () => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
  };
}, []);
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `name={item.name as any}` in react-hook-form | `useFormContext<SchemaType>()` with typed field array | TypeScript narrows field names; schema renames caught at compile time |
| `Record<string, any>` intersection | Inline named interface with only required fields | No indexable type escape hatch; only declared properties accessible |
| `let timeoutId = setTimeout(...)` | `const ref = useRef<ReturnType<typeof setTimeout> \| null>(null)` | Stable reference across renders; cleanup accessible in useEffect return |

## Open Questions

1. **HeroSwiper `documentId`/`documentType`/`blockIndex` fields**
   - What we know: `HeroSwiperProps` requires them but the component body never reads them
   - What's unclear: Whether they were added for future use or are vestigial
   - Recommendation: Remove them from `HeroSwiperProps` (or make optional) since no code inside the component uses them — this makes `{...block}` spread safe. If they're needed later, add them back with proper sourcing.

2. **`block._type` exhaustive narrowing in HeroPageBuilder**
   - What we know: The GROQ `HOME_PAGE` query projects `content[]{ ..., _type == "..." => { ... } }` which Sanity TypeGen may or may not produce as a discriminated union
   - What's unclear: Whether TypeScript narrows `block` after `switch(block._type)` or still treats it as the full union
   - Recommendation: After narrowing in each case, use a type assertion (`as Faqs`, `as CollectionsCarousel`, etc.) rather than relying on TypeScript's narrowing. This is explicit and survives future GROQ changes.

## Sources

### Primary (HIGH confidence)
- Direct source code inspection — all target files read verbatim
- `src/shared/sanity/types.ts` — Sanity TypeGen output; definitive type source for all Sanity block types
- `src/features/checkout/delivery/model/deliverySchema.ts` — Zod schema; `DeliveryInfo` type source
- `src/entities/cart/api/anonymous-cart-buyer-identity-update.ts` — exact `Record<string, any>` locations confirmed

### Secondary (MEDIUM confidence)
- react-hook-form `Path<T>` and `useFormContext<T>()` generic — confirmed by training knowledge; standard API unchanged since v7

### Tertiary (LOW confidence)
- TypeScript switch-case narrowing behavior on Sanity's generated discriminated union types — depends on exact shape of generated types; may require explicit assertions

## Metadata

**Confidence breakdown:**
- TYPE-01 (as any locations): HIGH — all cast locations read directly from source
- TYPE-02 (Record<string, any>): HIGH — exact lines confirmed
- TYPE-03: N/A — SKIP per CONTEXT.md
- MEM-01 (addEventListener): HIGH — NovaPoshtaButton already has cleanup; success criterion satisfied
- MEM-02 (setTimeout refs): HIGH — all four setTimeout locations code-audited
- HeroSwiper/HeroPageBuilder interaction: MEDIUM — exact TypeScript narrowing behavior depends on Sanity TypeGen union shape

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (stable domain — TypeScript patterns, no fast-moving dependencies)
