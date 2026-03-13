---
phase: quick
plan: 2
type: execute
wave: 1
depends_on: []
files_modified:
  - src/features/newsletter/ui/NewsletterSection.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "NewsletterSection heading displays in Ukrainian when locale is uk"
    - "NewsletterSection heading displays in Russian when locale is ru"
    - "No hardcoded Ukrainian strings remain in NewsletterSection.tsx"
  artifacts:
    - path: "src/features/newsletter/ui/NewsletterSection.tsx"
      provides: "Localized newsletter section heading"
      contains: "getTranslations"
  key_links:
    - from: "src/features/newsletter/ui/NewsletterSection.tsx"
      to: "messages/uk.json + messages/ru.json"
      via: "getTranslations('Newsletter') -> t('heading')"
      pattern: "getTranslations.*Newsletter"
---

<objective>
Replace the hardcoded Ukrainian heading in NewsletterSection with a next-intl translation key.

Purpose: The heading "Приєднуйтесь до нас і отримайте доступ до закритих розпродажів" is hardcoded in Ukrainian. Both locale files already have the correct translation under Newsletter.heading. This wires the component to use it.

Output: NewsletterSection.tsx uses getTranslations('Newsletter') and renders t('heading') — heading is locale-aware.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md

Note from STATE.md decision [08-03]: "NewsletterSection heading hardcoded Ukrainian — consistent with CONTEXT.md screenshot; form strings remain i18n via useTranslations". This quick task overrides that decision by adding the heading translation key (which already exists in both locale files).

<interfaces>
<!-- Existing translation keys — both locales already have these. No message file changes needed. -->

messages/uk.json "Newsletter" namespace:
{
  "heading": "Приєднуйтесь до нас і отримайте доступ до закритих розпродажів",
  "forHer": "Для неї",
  "forHim": "Для нього",
  "emailPlaceholder": "Ваш email",
  "submit": "Підписатися",
  "success": "Дякуємо! Ви підписані",
  "emailError": "Введіть коректний email"
}

messages/ru.json "Newsletter" namespace:
{
  "heading": "Присоединяйтесь к нам и получите доступ к закрытым распродажам",
  ...
}

Current NewsletterSection.tsx (Server Component, no 'use client'):
- Hardcodes heading as JSX string literal
- Renders <NewsletterForm /> which already uses useTranslations('Newsletter') for all form strings

Pattern from codebase (CollectionGrid.tsx, BrandGrid.tsx):
  import { getTranslations } from 'next-intl/server';
  const t = await getTranslations('Newsletter');
  // No locale prop needed — next-intl infers from request context
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Wire NewsletterSection heading to translation key</name>
  <files>src/features/newsletter/ui/NewsletterSection.tsx</files>
  <action>
    Convert NewsletterSection to an async Server Component and replace the hardcoded heading with t('heading').

    1. Add `import { getTranslations } from 'next-intl/server';` at the top.
    2. Change the function signature to `export const NewsletterSection = async () => {`.
    3. Add `const t = await getTranslations('Newsletter');` as the first line of the function body.
    4. Replace the hardcoded `<p>` content with `{t('heading')}`.

    Do NOT add a 'use client' directive — this is a Server Component.
    Do NOT pass a locale prop — next-intl infers from request context (matches CollectionGrid/BrandGrid pattern).
    Do NOT touch messages/*.json — both locale files already have the heading key.
    Do NOT modify NewsletterForm.tsx — it already handles its own translations.

    Final file should look like:
    ```tsx
    import { getTranslations } from 'next-intl/server';
    import { NewsletterForm } from './NewsletterForm';

    export const NewsletterSection = async () => {
      const t = await getTranslations('Newsletter');
      return (
        <section className="container w-full bg-neutral-100 flex items-center justify-center">
          <div className=" max-w-xl flex flex-col gap-8 py-16 w-full">
            <p className="text-2xl md:text-3xl font-light text-center">
              {t('heading')}
            </p>
            <NewsletterForm />
          </div>
        </section>
      );
    };
    ```
  </action>
  <verify>
    <automated>cd /Users/mnmac/Development/nnshop && npm run lint -- --max-warnings=0 2>&1 | tail -5</automated>
  </verify>
  <done>
    - NewsletterSection.tsx contains no hardcoded Ukrainian/Russian strings
    - File imports getTranslations from next-intl/server
    - Function is async and awaits getTranslations('Newsletter')
    - Heading renders t('heading')
    - Lint passes with no errors
  </done>
</task>

</tasks>

<verification>
After the task completes:
1. Open http://localhost:3000/uk — scroll to newsletter section, heading must be in Ukrainian
2. Open http://localhost:3000/ru — scroll to newsletter section, heading must be in Russian
3. Confirm no hardcoded Ukrainian text remains in NewsletterSection.tsx
</verification>

<success_criteria>
- NewsletterSection heading is locale-aware (uk: Ukrainian text, ru: Russian text)
- No hardcoded strings in NewsletterSection.tsx
- Lint passes
- Both locale files unchanged (heading keys already existed)
</success_criteria>

<output>
After completion, create `.planning/quick/2-add-localization-to-newslettersection/2-SUMMARY.md` with what was done.
</output>
