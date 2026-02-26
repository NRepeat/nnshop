# Phase 7: Lighthouse Audit Fixes — Research

**Researched:** 2026-02-26
**Domain:** Web accessibility, SEO metadata, React hydration, Next.js Image optimization
**Confidence:** HIGH

---

## Summary

Phase 7 addresses six discrete Lighthouse-identified issues across four concerns: SEO meta descriptions, accessibility of interactive elements and HTML structure, WCAG color contrast, and React hydration/LCP performance. All issues are small, surgical changes to existing files — no new libraries, no new API integrations, no architecture changes.

The most architecturally interesting fix is the React hydration error (#419), which likely originates from `useWindowSize()` in `Gallery.tsx` causing a server/client render discrepancy in the Carousel's `slidesToScroll` option. The fix eliminates the `useWindowSize` dependency from the render path. The LCP fix is a single `priority` prop addition to the first product image in `Gallery.tsx`.

**Primary recommendation:** Fix all six issues in three plans grouped by concern: (1) SEO + QUAL, (2) A11Y interactive elements + contrast, (3) A11Y HTML structure + verification.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEO-01 | Product and collection pages render a unique `<meta name="description">` | `generateProductMetadata` and `generateCollectionMetadata` in `src/shared/lib/seo/generateMetadata.ts` already wire description through — fix is adding fallback when Shopify description is empty |
| A11Y-01 | All interactive elements have accessible names — hamburger button and icon-only links have `aria-label` | Hamburger button already fixed (NavigationSheet.tsx line 63 has `aria-label="Open menu"`); Telegram and Viber links in `announcement-bar.tsx` still missing `aria-label` |
| A11Y-02 | Footer copyright text meets WCAG 2.1 AA contrast ratio (≥ 4.5:1) | `text-white/40` on `bg-[#1a1a1a]` = 3.83:1; changing to `text-white/50` = 5.24:1 passes |
| A11Y-03 | HTML structure valid — `<li>` inside `<ul>/<ol>`, headings sequential | Two separate sub-issues: (1) `PersistLinkNavigation` renders `NavigationMenuItem` (`<li>`) without `NavigationMenuList` (`<ul>`) parent; (2) `AccordionPrimitive.Header` renders as `<h3>` breaking h1 → h3 sequence |
| QUAL-01 | React hydration error #419 eliminated | Caused by `useWindowSize()` SSR null → real value mismatch in `Gallery.tsx` affecting Carousel `slidesToScroll` prop; `console.log(quiqView)` in render path also needs removal |
| QUAL-02 | Product hero image has Next.js `priority` prop | `Gallery.tsx` uses `fetchPriority="high"` and `loading="eager"` but NOT the `priority` prop, which is what Next.js uses to inject `<link rel="preload">` |
</phase_requirements>

---

## Standard Stack

### Core (no new packages needed)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `next/image` | Next.js 16.1.0 | Image optimization + preload | `priority` prop adds `<link rel="preload">` to head |
| `next` Metadata API | 16.1.0 | SEO meta tags | `generateMetadata()` in page files |
| Tailwind CSS v4 | 4.x | Color classes | `text-white/50` = 50% opacity white |
| `@radix-ui/react-accordion` | current | Accordion heading | `AccordionPrimitive.Header` renders `Primitive.h3` — use `asChild` to override |

### No new packages needed

All fixes use existing libraries and patterns. No `npm install` required.

---

## Architecture Patterns

### Recommended Project Structure (no changes)

All changes are surgical edits within existing files. No new files needed.

### Pattern 1: Next.js Image `priority` prop

**What:** `priority={true}` on a Next.js `<Image>` injects `<link rel="preload" as="image">` into the document head, causing the browser to fetch the image before paint. This is separate from `fetchPriority="high"` (browser hint) and `loading="eager"` (disables lazy loading).

**When to use:** The LCP element — the first product image in the gallery carousel.

**Example:**
```typescript
// Gallery.tsx — first image in carousel
<Image
  src={image.url}
  alt={image.altText || ''}
  fill
  className="object-contain rounded-md max-h-[60vh]"
  onClick={open}
  priority={index === 0}          // ADD: injects preload link tag
  fetchPriority={index === 0 ? 'high' : 'auto'}   // keep (belt+suspenders)
  loading={index === 0 ? 'eager' : 'lazy'}          // keep (still valid)
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
/>
```

### Pattern 2: Meta description fallback

**What:** When `product.description` is empty string in Shopify, `'' || undefined` evaluates to `undefined`, and Next.js does not emit a `<meta name="description">` tag. Add a fallback string.

**When to use:** `generateProductMetadata` and `generateCollectionMetadata`.

**Example:**
```typescript
// src/shared/lib/seo/generateMetadata.ts
export function generateProductMetadata(product, locale, slug): Metadata {
  const description =
    product.description ||
    `${product.title} — купити в інтернет-магазині Mio Mio`;

  return generatePageMetadata({ title: product.title, description, image: product.featuredImage?.url }, locale, `/product/${slug}`);
}

export function generateCollectionMetadata(collection, locale, slug, gender?): Metadata {
  const description =
    collection.description ||
    `${collection.title} — каталог товарів інтернет-магазину Mio Mio`;

  const prefix = gender ? `/${gender}` : '';
  return generatePageMetadata({ title: collection.title, description, image: collection.image?.url }, locale, `${prefix}/${slug}`);
}
```

### Pattern 3: `aria-label` on icon-only links

**What:** Links and buttons that contain only icons (SVGs) have no accessible name visible to screen readers. Add `aria-label` to the `<a>` element directly.

**When to use:** Any `<a>` or `<button>` that contains only an icon with no visible text.

**Example:**
```typescript
// announcement-bar.tsx — Telegram link
<a
  href="https://t.me/miomio_com_ua"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Telegram"
>
  <Button variant={'default'} className="bg-foreground" asChild>
    <span><Send className="max-w-[16px]" /></span>
  </Button>
</a>

// Viber link
<a
  href={viberUrl}
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Viber"
>
  ...
</a>
```

### Pattern 4: Fix `<li>` without `<ul>` parent — `PersistLinkNavigation`

**What:** `PersistLinkNavigation` renders `NavigationMenuItem` components (which are Radix `Primitive.li` elements) without a `NavigationMenuList` (`<ul>`) parent. This produces invalid HTML: `<li>` inside `<div>`.

**Where:** Two call sites:
- `src/widgets/header/ui/Header.tsx` line 92 — mobile gender nav (`div.justify-center`)
- `src/features/header/ui/HeaderContent.tsx` line 19 — desktop gender nav (`div.justify-start`)

**Fix approach:** Wrap `PersistLinkNavigation`'s rendered `NavigationMenuItem` elements in a `NavigationMenuList`. The cleanest solution is to wrap the render output inside `PersistLinkNavigation` itself in a fragment that includes `NavigationMenuList`:

```typescript
// PersistLinkNavigation.tsx — wrap the fragment in NavigationMenuList
import { NavigationMenuList } from '@shared/ui/navigation-menu';

return (
  <NavigationMenuList>
    {links.map((link) => (
      <NavigationMenuItem key={link.slug} className="flex p-0">
        ...
      </NavigationMenuItem>
    ))}
  </NavigationMenuList>
);
```

**Caveat:** `NavigationMenuList` renders as `<ul>` which requires it to be inside `NavigationMenu` (which renders as `nav`). If the parent doesn't have `NavigationMenu`, use a plain `<ul>` instead:

```typescript
// Alternative: plain HTML if no NavigationMenu parent
return (
  <ul className="flex">
    {links.map((link) => (
      <li key={link.slug} className="flex p-0">
        ...
      </li>
    ))}
  </ul>
);
```

**NOTE:** The Lighthouse audit selector is `header.sticky > div.container > div.justify-center > li.relative` — the mobile section in `Header.tsx`. The `HeaderContent.tsx` desktop section (`div.justify-start > hidden`) also renders `NavigationMenuItem` without a list parent, but it's hidden on mobile and may not have been flagged. Fix both to be safe.

### Pattern 5: Fix accordion heading order — `AccordionPrimitive.Header`

**What:** Radix `AccordionPrimitive.Header` renders as `<h3>` by default. This causes a heading order violation (h1 → h3, skipping h2) on the product page. The fix uses `asChild` on `AccordionPrimitive.Header` to render as a `<div>` instead of `<h3>`.

**Change location:** `src/shared/ui/accordion.tsx` — the shared `AccordionTrigger` component.

**Example:**
```typescript
// accordion.tsx — before
function AccordionTrigger({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger ...>

// accordion.tsx — after
function AccordionTrigger({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Header asChild>
      <div className="flex">
        <AccordionPrimitive.Trigger ...>
      </div>
    </AccordionPrimitive.Header>
  );
}
```

**Impact:** Affects all `AccordionTrigger` usages in the codebase. Visual appearance is unchanged (same flexbox layout). The h3 heading is replaced with a div, removing the semantic heading entirely. This is acceptable because accordion triggers are interactive controls, not heading landmarks.

### Pattern 6: Fix React hydration error — remove `useWindowSize` from render path

**What:** `Gallery.tsx` uses `useWindowSize()` from `@uidotdev/usehooks`, which returns `{ width: null }` on server and actual dimensions after `useLayoutEffect`. The `md` variable computed from `windowWidth` is used in the Carousel `slidesToScroll` prop, causing a server/client prop mismatch that triggers React 19's strict hydration checks.

**Fix:** Remove the `useWindowSize` dependency from the render path. The `slidesToScroll` behavior can be achieved without measuring window width — use a fixed value or rely on the Embla Carousel's built-in responsive behavior.

**Before:**
```typescript
const { width: windowWidth } = useWindowSize();
const md = windowWidth && windowWidth >= 768;
// ...
<Carousel opts={{ slidesToScroll: !md ? 3 : 5 }}>
```

**After:**
```typescript
// Remove useWindowSize import and usage entirely
// Use a fixed slidesToScroll or CSS breakpoints
<Carousel opts={{ slidesToScroll: 'auto' }}>
// or simply: slidesToScroll: 4 (works fine for both mobile and desktop)
```

**Also:** Remove `console.log(quiqView, "quiqView")` from the component body (line 83).

### Pattern 7: Footer contrast fix

**What:** `text-white/40` on `bg-[#1a1a1a]` produces 3.83:1 contrast ratio (fails WCAG AA 4.5:1). Changing to `text-white/50` produces 5.24:1 (passes).

**File:** `src/widgets/footer/ui/Footer.tsx` line 209.

```typescript
// Before:
<div className="container mx-auto px-4 py-4 text-center text-white/40 text-sm">

// After:
<div className="container mx-auto px-4 py-4 text-center text-white/50 text-sm">
```

### Anti-Patterns to Avoid

- **Don't add `next.config.ts` image settings:** The constraint explicitly prohibits this. Use only the `priority` prop.
- **Don't touch `robots.txt`:** Intentionally blocking crawlers before launch.
- **Don't use `fetchPriority` alone for LCP:** `fetchPriority="high"` is a browser hint but does NOT inject a preload link. Only `priority={true}` on Next.js Image injects `<link rel="preload">`.
- **Don't suppress hydration warning:** Fix the root cause (remove `useWindowSize` from render), don't mask it.
- **Don't use `absolute` title for all metadata:** Only needed if the template actually causes error #419. Current research shows Next.js `resolveTitle` produces a string (not array), so the title template is not the hydration error source — the `useWindowSize` is.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Contrast calculation | Custom color contrast checker | Use computed values from research (white/50 = 5.24:1) | Already calculated, just change the class |
| Image preloading | Custom preload logic | Next.js `priority` prop | Next.js handles the `<link rel="preload">` injection |
| Responsive breakpoints | Custom window size hooks | Tailwind CSS classes or Carousel `slidesToScroll: 'auto'` | Avoid SSR/client mismatch entirely |

---

## Common Pitfalls

### Pitfall 1: `priority` vs `fetchPriority` vs `loading`

**What goes wrong:** Developer adds `fetchPriority="high"` thinking it handles LCP optimization. It does NOT add a preload link — it only hints the browser's internal fetch priority. LCP improvement requires `priority={true}` on the Next.js `<Image>` component.

**How to avoid:** Use `priority={index === 0}` in Gallery.tsx. You can keep `fetchPriority` and `loading` for belt+suspenders but `priority` is the critical prop.

**Warning signs:** Lighthouse still shows LCP as slow; network panel shows image is not preloaded.

### Pitfall 2: `useWindowSize` SSR mismatch

**What goes wrong:** `useWindowSize` from `@uidotdev/usehooks` uses `useLayoutEffect` internally, which means it returns `{ width: null, height: null }` on the server. When this value drives a Carousel prop (like `slidesToScroll`), the server-rendered prop value differs from the post-mount value. React 19 is stricter about detecting these mismatches.

**How to avoid:** Remove the `useWindowSize` usage from the render path. The thumbnail carousel scroll behavior works fine with `slidesToScroll: 'auto'` or a fixed value.

**Warning signs:** React error in production console, hydration mismatch visible in development.

### Pitfall 3: Changing shared `accordion.tsx` affects all accordions

**What goes wrong:** Modifying `AccordionPrimitive.Header` to use `asChild` in the shared component changes the HTML structure for ALL accordion usages (CollectionFilters, OrderSummary, InternalMenu, ProductInfo). If any of those rely on `h3` for heading structure, this breaks them.

**How to avoid:** Check all usages first (done — 4 places). None of them are in a context where h3 is needed as a heading landmark. The `asChild+div` approach is safe for all usages.

**Warning signs:** Screen reader announces accordion triggers as headings (acceptable change — they shouldn't be headings).

### Pitfall 4: `aria-label` on inner `<Button>` vs outer `<a>`

**What goes wrong:** Adding `aria-label` to the inner `<Button>` inside an `<a>` element doesn't fix the Lighthouse issue. The Lighthouse selector points to the `<a>` element as the link without accessible name.

**How to avoid:** Add `aria-label` to the `<a>` element directly (the outer element). The inner Button's aria-label would be redundant but not harmful.

**Warning signs:** Lighthouse still reports the link as lacking a name even after adding aria-label to the Button child.

### Pitfall 5: `NavigationMenuList` requires `NavigationMenu` parent context

**What goes wrong:** `NavigationMenuList` (from Radix) is a `<ul>` component that expects a `NavigationMenu` parent for context (open/close state management). If used standalone without `NavigationMenu`, it may throw a context error.

**How to avoid:** In `PersistLinkNavigation.tsx`, if the component is not wrapped in `NavigationMenu` at the call site, use a plain `<ul className="flex">` with `<li>` children instead of `NavigationMenuList` with `NavigationMenuItem`. Check the call sites in `Header.tsx` and `HeaderContent.tsx`.

**Resolution:** Looking at the call sites:
- `Header.tsx` line 92: PersistLinkNavigation is inside `div.container > div.w-full > div.justify-center` — no NavigationMenu wrapper. Use plain `<ul>`+`<li>` here.
- `HeaderContent.tsx` line 19: Also no NavigationMenu wrapper. Use plain `<ul>`+`<li>`.

**The fix:** In `PersistLinkNavigation.tsx`, replace `NavigationMenuItem` with `<li>` elements, and wrap in `<ul>` (not `NavigationMenuList`).

---

## Code Examples

Verified patterns from codebase inspection:

### Gallery.tsx — Current (problematic) state
```typescript
// src/features/product/ui/Gallery.tsx lines 81-83
const { width: windowWidth } = useWindowSize();
const md = windowWidth && windowWidth >= 768;
console.log(quiqView,"quiqView")  // <- debug log in render path
// ...
<Carousel opts={{ slidesToScroll: !md ? 3 : 5 }}>
```

### Gallery.tsx — Fixed state
```typescript
// Remove useWindowSize import and md variable
// Remove console.log

// First image in main carousel:
<Image
  src={image.url}
  alt={image.altText || ''}
  fill
  className="object-contain rounded-md max-h-[60vh]"
  onClick={open}
  priority={index === 0}
  fetchPriority={index === 0 ? 'high' : 'auto'}
  loading={index === 0 ? 'eager' : 'lazy'}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
/>

// Thumbnail carousel — remove md dependency:
<Carousel opts={{ dragFree: true, slidesToScroll: 'auto' }}>
```

### AccordionTrigger — Fixed to use div header
```typescript
// src/shared/ui/accordion.tsx
function AccordionTrigger({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Header asChild>
      <div className="flex">
        <AccordionPrimitive.Trigger
          data-slot="accordion-trigger"
          className={cn(
            'focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
            className,
          )}
          {...props}
        >
          {children}
          <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
        </AccordionPrimitive.Trigger>
      </div>
    </AccordionPrimitive.Header>
  );
}
```

### PersistLinkNavigation — Fixed to use ul+li
```typescript
// src/features/header/navigation/ui/PersistLinkNavigation.tsx
// Replace NavigationMenuItem with <li> and wrap in <ul>
return (
  <ul className="flex items-center gap-0">
    {links.map((link) => {
      const label = t.has(link.slug) ? t(link.slug) : link.slug;
      return (
        <li key={link.slug} className="flex p-0">
          <Link href={`/${locale}/${link.slug}`}>
            <Suspense fallback={<NavButton slug={link.slug}><div className="h-6 w-20 animate-pulse bg-gray-200 rounded" /></NavButton>}>
              <GenderSession label={label} slug={link.slug} />
            </Suspense>
          </Link>
        </li>
      );
    })}
  </ul>
);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual LCP optimization with fetchPriority | Next.js `priority` prop injects preload link | Next.js 13+ | Correctly prioritizes LCP image |
| Accordion renders h3 for accessible name | `asChild` + div for non-heading triggers | Radix UI docs recommend | Eliminates heading order violations |
| useWindowSize for responsive JS logic | CSS-based responsive or `slidesToScroll: 'auto'` | React 19 SSR strictness | Eliminates hydration mismatches |

---

## Open Questions

1. **React error #419 exact source**
   - What we know: `Gallery.tsx` has `useWindowSize()` causing server/client prop mismatch for `slidesToScroll`; there's also a `console.log` in the render path
   - What's unclear: Whether the error is from the Carousel prop mismatch (should be #418 for prop mismatch) or from another source (title template is ruled out — Next.js `resolveTitle` produces a string)
   - Recommendation: Fix both `useWindowSize` mismatch and remove `console.log`; if error persists, investigate ProductInfo client-side state

2. **`slidesToScroll: 'auto'` compatibility with Embla**
   - What we know: Embla Carousel (underlying Gallery.tsx) supports `'auto'` as a value for `slidesToScroll`
   - What's unclear: Whether `'auto'` produces visually identical behavior to the current 3/5 logic
   - Recommendation: Use `slidesToScroll: 'auto'` — Embla's auto mode adapts to container width, which is the intent

3. **PersistLinkNavigation call site context**
   - What we know: Neither call site in `Header.tsx` (mobile) nor `HeaderContent.tsx` (desktop) wraps `PersistLinkNavigation` in `NavigationMenu`
   - What's unclear: Whether the `NavButton` component depends on `NavigationMenuItem` context
   - Recommendation: Replace `NavigationMenuItem` with plain `<li>` in `PersistLinkNavigation` — check `NavButton` has no NavigationMenu context dependency

---

## Sources

### Primary (HIGH confidence)

- Codebase inspection: all files cited above read directly
- Computed contrast ratios: calculated with W3C luminance formula; `text-white/40` = #767676 = 3.83:1 on #1a1a1a; `text-white/50` = #8d8d8d = 5.24:1 on #1a1a1a
- `/Users/mnmac/Development/nnshop/node_modules/@radix-ui/react-accordion/dist/index.js` — confirmed `AccordionHeader` renders `Primitive.h3`
- `/Users/mnmac/Development/nnshop/node_modules/@radix-ui/react-navigation-menu/dist/index.js` — confirmed `NavigationMenuPrimitive.Item` renders `Primitive.li`
- `/Users/mnmac/Development/nnshop/node_modules/next/dist/lib/metadata/resolvers/resolve-title.js` — confirmed title template produces a string (not Array)
- `/Users/mnmac/Development/nnshop/node_modules/@uidotdev/usehooks/index.js` — confirmed `useWindowSize` starts with `{ width: null, height: null }` and uses `useLayoutEffect`
- Next.js Image docs behavior: `priority` prop adds preload link; `fetchPriority` alone does not

### Secondary (MEDIUM confidence)

- React 19 error #419 = title tag children as Array (cross-referenced with Next.js server rendering code — title is produced as string by `resolveTitle`, so #419 is likely caused differently)
- Embla Carousel `slidesToScroll: 'auto'` behavior (from Embla docs knowledge)

### Tertiary (LOW confidence)

- The exact code path that triggers error #419 in production — requires runtime inspection beyond static analysis

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified in node_modules
- Architecture: HIGH — all file paths and code snippets verified by reading files
- Pitfalls: HIGH — derived from actual code structure, not assumptions
- React error #419 exact source: MEDIUM — static analysis points to `useWindowSize` SSR mismatch as most likely; exact error code unclear without runtime inspection

**Research date:** 2026-02-26
**Valid until:** 2026-03-28 (30 days — stable libraries)
