---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/shared/sanity/schemaTypes/shopify/shemas/documents/collection.tsx
  - src/shared/sanity/lib/query.ts
  - src/shared/sanity/types.ts
  - src/features/collection/ui/CollectionGrid.tsx
autonomous: true
requirements: [QUICK-1]

must_haves:
  truths:
    - "Sanity Studio collection documents show an isBrand checkbox in the editorial tab"
    - "Sanity types reflect the isBrand field after typegen"
    - "Collection pages for brand collections redirect visitors to /brand/[slug]"
  artifacts:
    - path: "src/shared/sanity/schemaTypes/shopify/shemas/documents/collection.tsx"
      provides: "isBrand boolean field in editorial group"
      contains: "name: 'isBrand'"
    - path: "src/shared/sanity/lib/query.ts"
      provides: "GROQ query to check isBrand by Shopify slug"
      exports: ["COLLECTION_IS_BRAND_QUERY"]
    - path: "src/features/collection/ui/CollectionGrid.tsx"
      provides: "redirect to /brand/[slug] when isBrand is true"
  key_links:
    - from: "src/features/collection/ui/CollectionGrid.tsx"
      to: "src/shared/sanity/lib/query.ts"
      via: "sanityFetch(COLLECTION_IS_BRAND_QUERY)"
      pattern: "sanityFetch.*COLLECTION_IS_BRAND"
---

<objective>
Add an `isBrand` boolean checkbox to the Sanity `collection` document schema, regenerate Sanity types, and wire the frontend so collection pages automatically redirect to `/brand/[slug]` when the collection is marked as a brand.

Purpose: Allows content editors to mark individual Shopify collections as brand collections in Sanity Studio, and the Next.js frontend respects that flag by routing users to the brand-specific page layout instead of the generic collection grid.

Output:
- `collection.tsx` schema with `isBrand` field in editorial group
- `query.ts` with `COLLECTION_IS_BRAND_QUERY` exported
- `types.ts` regenerated to include `isBrand?: boolean` on the collection document
- `CollectionGrid.tsx` fetches `isBrand` via Sanity and calls `redirect()` to `/brand/[slug]` when true
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<!-- Key interfaces the executor needs -->
</context>

<interfaces>
<!-- From src/shared/sanity/schemaTypes/shopify/shemas/documents/collection.tsx -->
The collection schema uses three GROUPS: 'theme', 'editorial' (default), 'shopifySync'.
All editorial content fields use `group: 'editorial'`. New `isBrand` field belongs in this group.

Example existing editorial field pattern:
```typescript
defineField({
  name: 'showHero',
  title: 'Show hero',
  type: 'boolean',
  description: 'If disabled, page title will be displayed instead',
  group: 'editorial',
}),
```

<!-- From src/shared/sanity/lib/query.ts -->
Queries use `defineQuery` from 'next-sanity'. Collections are queried by `store.slug.current` (the Shopify handle). Example pattern:
```groq
*[_type == "collection" && store.slug.current == $handle][0]{ isBrand }
```

<!-- From src/shared/sanity/lib/client.ts -->
```typescript
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  revalidate = 60,
  tags = [],
}: {
  query: QueryString;
  params?: QueryParams;
  revalidate?: number | false;
  tags?: string[];
})
```

<!-- From src/features/collection/ui/CollectionGrid.tsx -->
CollectionGrid is an async Server Component. It already imports `notFound` from 'next/navigation'.
The resolved collection handle is available as `resolvedHandle` (string).
The `locale` is available. The brand route is `/brand/[slug]`.
Add `redirect` import from 'next/navigation'. Call `redirect(`/${locale}/brand/${resolvedHandle}`)` before rendering if `isBrand` is true.
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add isBrand field to Sanity collection schema</name>
  <files>src/shared/sanity/schemaTypes/shopify/shemas/documents/collection.tsx</files>
  <action>
Add the following `defineField` entry to the `fields` array in the collection schema, immediately after the `showHero` field (around line 88) and before the `hero` field. Place it in the `editorial` group:

```typescript
defineField({
  name: 'isBrand',
  title: 'Is Brand',
  type: 'boolean',
  description: 'When enabled, this collection is treated as a brand — the frontend routes to /brand/[slug] instead of the gender collection layout.',
  group: 'editorial',
}),
```

No other changes to the file. The field is a simple boolean, no hidden logic needed.
  </action>
  <verify>
    <automated>node -e "const f = require('fs'); const c = f.readFileSync('src/shared/sanity/schemaTypes/shopify/shemas/documents/collection.tsx','utf8'); console.log(c.includes(\"name: 'isBrand'\") ? 'PASS' : 'FAIL: isBrand field not found')"</automated>
  </verify>
  <done>The `isBrand` boolean field appears in the collection schema's `fields` array with `group: 'editorial'`.</done>
</task>

<task type="auto">
  <name>Task 2: Add GROQ query and wire CollectionGrid redirect</name>
  <files>
    src/shared/sanity/lib/query.ts
    src/features/collection/ui/CollectionGrid.tsx
    src/shared/sanity/types.ts
  </files>
  <action>
**Step 1 — Add GROQ query to src/shared/sanity/lib/query.ts:**

Append the following export at the end of the file (after FOOTER_QUERY or last export):

```typescript
export const COLLECTION_IS_BRAND_QUERY = defineQuery(
  `*[_type == "collection" && store.slug.current == $handle][0]{ isBrand }`
);
```

**Step 2 — Run typegen to regenerate src/shared/sanity/types.ts:**

```bash
cd /Users/mnmac/Development/nnshop && npm run typegen
```

This updates `src/shared/sanity/types.ts` to include `isBrand?: boolean` on the COLLECTION document type.

**Step 3 — Wire CollectionGrid.tsx:**

In `src/features/collection/ui/CollectionGrid.tsx`:

1. Add `redirect` to the existing `'next/navigation'` import:
   ```typescript
   import { notFound, redirect } from 'next/navigation';
   ```

2. Add `COLLECTION_IS_BRAND_QUERY` to the imports from `@shared/sanity/lib/query`:
   - Check if this module is already imported; if not, add:
   ```typescript
   import { COLLECTION_IS_BRAND_QUERY } from '@shared/sanity/lib/query';
   ```

3. Add `sanityFetch` import from `@shared/sanity/lib/client`:
   ```typescript
   import { sanityFetch } from '@shared/sanity/lib/client';
   ```

4. Inside the `CollectionGrid` async function body, after `resolvedHandle` is computed (around line 77) and BEFORE the `getCollection` calls, add:

```typescript
const sanityCollection = await sanityFetch({
  query: COLLECTION_IS_BRAND_QUERY,
  params: { handle: resolvedHandle },
  tags: [`collection:${resolvedHandle}`],
});

if (sanityCollection?.isBrand) {
  redirect(`/${locale}/brand/${resolvedHandle}`);
}
```

This ensures brand collections served via the gender/collection route transparently redirect to the brand page. The `redirect()` from Next.js throws internally, so no early return is needed.
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -20</automated>
  </verify>
  <done>
- `COLLECTION_IS_BRAND_QUERY` is exported from query.ts
- `src/shared/sanity/types.ts` contains `isBrand?: boolean` in the collection type (confirmed by typegen run)
- `CollectionGrid.tsx` fetches `isBrand` from Sanity and redirects to `/[locale]/brand/[slug]` when true
- `npm run build` completes without TypeScript errors
  </done>
</task>

</tasks>

<verification>
1. Sanity Studio (run `npx sanity dev` or check studio at /studio): Open any collection document — the "Editorial" tab should show an "Is Brand" checkbox.
2. TypeScript check: `npx tsc --noEmit` passes with no new errors.
3. Build check: `npm run build` succeeds.
4. Runtime: A collection with `isBrand: true` set in Sanity, when visited at `/[locale]/[gender]/[slug]`, should redirect to `/[locale]/brand/[slug]`.
</verification>

<success_criteria>
- `isBrand` boolean field present in `collection.tsx` schema under `editorial` group
- `COLLECTION_IS_BRAND_QUERY` exported from `src/shared/sanity/lib/query.ts`
- `src/shared/sanity/types.ts` includes `isBrand?: boolean` on collection document type
- `CollectionGrid.tsx` redirects to `/brand/[slug]` when `isBrand` is true
- Build passes without TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/1-add-isbrand-checkbox-to-sanity-collectio/1-SUMMARY.md` with what was implemented.
</output>
