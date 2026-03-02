---
phase: quick
plan: 3
type: execute
wave: 1
depends_on: []
files_modified:
  - src/shared/sanity/schemaTypes/sharedSectionType.ts
  - src/shared/sanity/schemaTypes/blocks/sharedSectionRefType.ts
  - src/shared/sanity/schemaTypes/pageBuilderType.ts
  - src/shared/sanity/schemaTypes/index.ts
  - src/shared/sanity/lib/query.ts
  - src/features/home/ui/HeroPageBuilder.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "sharedSection document type exists in Sanity schema"
    - "sharedSectionRef object type exists and is added to pageBuilderType"
    - "HOME_PAGE_QUERY dereferences sharedSectionRef -> section -> content[]"
    - "HeroPageBuilder handles _type == 'sharedSectionRef' by rendering its content blocks"
    - "npm run typegen runs without errors"
  artifacts:
    - path: "src/shared/sanity/schemaTypes/sharedSectionType.ts"
      provides: "Standalone reusable section document type"
      contains: "defineType.*sharedSection.*document"
    - path: "src/shared/sanity/schemaTypes/blocks/sharedSectionRefType.ts"
      provides: "PageBuilder array member that references a sharedSection document"
      contains: "defineType.*sharedSectionRef.*object"
  key_links:
    - from: "src/shared/sanity/schemaTypes/pageBuilderType.ts"
      to: "src/shared/sanity/schemaTypes/blocks/sharedSectionRefType.ts"
      via: "defineArrayMember({ type: 'sharedSectionRef' })"
      pattern: "sharedSectionRef"
    - from: "src/features/home/ui/HeroPageBuilder.tsx"
      to: "sharedSectionRef blocks"
      via: "case 'sharedSectionRef'"
      pattern: "sharedSectionRef"
---

<objective>
Add a "Shared Section" reusable block system to Sanity pageBuilder.

Purpose: Allow content editors to create standalone Section documents in Sanity Studio, then reference the same section from multiple pages. Editing the document once updates it everywhere.

Output: Studio gains a "Shared Sections" document type. PageBuilder gets a new "Shared Section" block that lets editors pick any existing shared section. Frontend renders the referenced section's content blocks inline.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md

Architecture notes:
- pageBuilderType.ts: array of all block types, used in pageType and siteSettingsType
- HeroPageBuilder.tsx: React switch renderer for all pageBuilder blocks
- HOME_PAGE_QUERY in query.ts: GROQ query fetching homePageMan/homePageWoman content[]
- sharedSection will have: internalTitle (string) + content (array of pageBuilder block types)
- sharedSectionRef will wrap a reference field so _type in array is 'sharedSectionRef' not 'reference'

<interfaces>
Current pageBuilderType.ts uses defineArrayMember({ type: 'brandGridBlock' }) etc.
New member: defineArrayMember({ type: 'sharedSectionRef' })

sharedSectionRef object fields:
  - section: { type: 'reference', to: [{ type: 'sharedSection' }] }

sharedSectionType document fields:
  - internalTitle: string (required, used only in Studio)
  - content: array of same block types as pageBuilderType (all except sharedSectionRef to avoid infinite nesting)

GROQ projection for HOME_PAGE_QUERY (add inside content[] projection in BOTH homePageMan and homePageWoman):
  _type == "sharedSectionRef" => {
    section->{
      _id,
      internalTitle,
      content[]{
        ...,
        _type == "brandGridBlock" => {
          barnds[]{
            ...,
            asset->{ _id, url, metadata{dimensions} },
            collection->{ _id, store{ slug{ current }, title } }
          }
        }
      }
    }
  }

HeroPageBuilder.tsx new case (renders inner blocks using same switch logic — extract renderBlock helper):
  case 'sharedSectionRef':
    const sharedContent = (block as any).section?.content;
    if (!Array.isArray(sharedContent)) return null;
    return (
      <Fragment key={block._key}>
        {sharedContent.map((innerBlock: any) => renderBlock(innerBlock, locale, gender))}
      </Fragment>
    );
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create sharedSectionType document schema</name>
  <files>src/shared/sanity/schemaTypes/sharedSectionType.ts</files>
  <action>
    Create a new file with a Sanity document type for reusable sections.

    The document has:
    - name: 'sharedSection'
    - type: 'document'
    - title: 'Shared Section'
    - icon: from '@sanity/icons' (use ComponentIcon or ShareIcon)
    - fields:
      1. internalTitle: string, required, description "Used only in Studio to identify this section"
      2. content: array of defineArrayMember for each block type in pageBuilderType EXCEPT sharedSectionRef (to avoid infinite nesting)
         Include: heroSlider, mainCollectionGrid, hero, brandGridBlock, splitImage, features, faqs, productCarousel, similarProducts, contentPageBlock, collectionsCarousel, sliderBlock, productDetails, elegantEase, productComments, collectionsWithPreviews, popularPosts
    - preview: select internalTitle, prepare returns { title: internalTitle ?? 'Untitled section', subtitle: 'Shared Section' }

    Import defineType, defineField, defineArrayMember from 'sanity'.
    Import ComponentIcon from '@sanity/icons'.
  </action>
  <verify>
    File exists and contains defineType with name: 'sharedSection' and type: 'document'
  </verify>
  <done>
    - File created at correct path
    - Has internalTitle field with required validation
    - Has content array with all block types (no sharedSectionRef)
    - Has preview configuration
  </done>
</task>

<task type="auto">
  <name>Task 2: Create sharedSectionRefType object schema</name>
  <files>src/shared/sanity/schemaTypes/blocks/sharedSectionRefType.ts</files>
  <action>
    Create a new file with a Sanity object type that wraps a reference to sharedSection.
    This is the type added to pageBuilder arrays so _type in stored data is 'sharedSectionRef'.

    ```typescript
    import { defineType, defineField } from 'sanity';
    import { ComponentIcon } from '@sanity/icons';

    export const sharedSectionRef = defineType({
      name: 'sharedSectionRef',
      title: 'Shared Section',
      type: 'object',
      icon: ComponentIcon,
      fields: [
        defineField({
          name: 'section',
          title: 'Section',
          type: 'reference',
          to: [{ type: 'sharedSection' }],
          validation: (r) => r.required(),
        }),
      ],
      preview: {
        select: {
          title: 'section.internalTitle',
        },
        prepare({ title }) {
          return {
            title: title ?? 'No section selected',
            subtitle: 'Shared Section',
          };
        },
      },
    });
    ```
  </action>
  <verify>
    File exists and contains defineType with name: 'sharedSectionRef' and type: 'object'
  </verify>
  <done>
    - File created at correct path
    - Has section reference field pointing to sharedSection
    - Has preview that shows the referenced section's internalTitle
  </done>
</task>

<task type="auto">
  <name>Task 3: Register types in index.ts and add to pageBuilderType</name>
  <files>
    src/shared/sanity/schemaTypes/index.ts
    src/shared/sanity/schemaTypes/pageBuilderType.ts
  </files>
  <action>
    **index.ts:**
    1. Add import: `import { sharedSectionType } from './sharedSectionType';`
    2. Add import: `import { sharedSectionRef } from './blocks/sharedSectionRefType';`
    3. Add both to the types array (near top with other block types):
       - sharedSectionType (document, before pageBuilderType)
       - sharedSectionRef (object)

    **pageBuilderType.ts:**
    1. Add `defineArrayMember({ type: 'sharedSectionRef' })` to the `of` array
       Place it first so it's prominent in Studio's insert menu.
  </action>
  <verify>
    grep "sharedSectionRef\|sharedSectionType\|sharedSection" src/shared/sanity/schemaTypes/index.ts
    grep "sharedSectionRef" src/shared/sanity/schemaTypes/pageBuilderType.ts
  </verify>
  <done>
    - Both types imported and registered in index.ts
    - sharedSectionRef added to pageBuilderType of array
  </done>
</task>

<task type="auto">
  <name>Task 4: Update HOME_PAGE_QUERY GROQ projection</name>
  <files>src/shared/sanity/lib/query.ts</files>
  <action>
    In HOME_PAGE_QUERY, inside BOTH homePageMan content[] and homePageWoman content[] blocks,
    add the sharedSectionRef projection after the existing _type conditions.

    Add after the `_type == "faqs" => { ... }` block in each section:

    ```groq
    _type == "sharedSectionRef" => {
      section->{
        _id,
        internalTitle,
        content[]{
          ...,
          _type == "brandGridBlock" => {
            barnds[]{
              ...,
              asset->{ _id, url, metadata{dimensions} },
              collection->{ _id, store{ slug{ current }, title } }
            }
          }
        }
      }
    }
    ```

    This must be added in both the homePageMan content[] block (around line 671-679) and
    the homePageWoman content[] block (around line 770-779).

    Important: preserve exact indentation style of the surrounding code.
  </action>
  <verify>
    grep -c "sharedSectionRef" src/shared/sanity/lib/query.ts
    # Should output 2 (one for homePageMan, one for homePageWoman)
  </verify>
  <done>
    - sharedSectionRef projection added in homePageMan content[]
    - sharedSectionRef projection added in homePageWoman content[]
    - GROQ uses ->{ } to dereference the section document
  </done>
</task>

<task type="auto">
  <name>Task 5: Handle sharedSectionRef in HeroPageBuilder.tsx</name>
  <files>src/features/home/ui/HeroPageBuilder.tsx</files>
  <action>
    Refactor HeroPageBuilder.tsx to:
    1. Extract the block rendering logic into a `renderBlock` helper function
    2. Add `case 'sharedSectionRef'` that iterates over the referenced section's content and renders each block using renderBlock

    **Pattern:**
    ```tsx
    import { Fragment } from 'react';

    // Add type at top of file:
    type SharedSectionRefBlock = { _type: 'sharedSectionRef'; _key: string; section?: { content?: PageContent[] } };

    // Extract renderBlock function (takes block, locale, gender — returns JSX.Element | null):
    const renderBlock = (block: PageContent, locale: Locale, gender: string): React.ReactNode => {
      switch (block._type) {
        // ... all existing cases moved here ...
        case 'sharedSectionRef': {
          const sharedContent = (block as unknown as SharedSectionRefBlock).section?.content;
          if (!Array.isArray(sharedContent)) return null;
          return (
            <Fragment key={(block as { _key: string })._key}>
              {sharedContent.map((innerBlock) => renderBlock(innerBlock, locale, gender))}
            </Fragment>
          );
        }
        // ... default case ...
      }
    };

    // HeroPageBuilder becomes:
    export const HeroPageBuilder = async ({ gender, locale }: HeroPageProps) => {
      const page = await getHomePage({ locale, gender });
      if (!page) return notFound();
      const { content } = page;
      if (!Array.isArray(content)) return null;
      return (
        <main className="flex flex-col">
          {content.map((block) => renderBlock(block, locale, gender))}
        </main>
      );
    };
    ```

    Important: renderBlock must be defined OUTSIDE the async component (as a regular function or arrow function) since it's called recursively and synchronously. The async data fetching stays in HeroPageBuilder.
  </action>
  <verify>
    <automated>cd /Users/mnmac/Development/nnshop && npm run lint -- --max-warnings=0 2>&1 | tail -10</automated>
  </verify>
  <done>
    - renderBlock helper extracts all switch cases
    - case 'sharedSectionRef' renders inner content recursively via renderBlock
    - Fragment used with key for React reconciliation
    - Lint passes
  </done>
</task>

<task type="auto">
  <name>Task 6: Run typegen to regenerate Sanity types</name>
  <files>src/shared/sanity/types.ts</files>
  <action>
    Run the Sanity typegen command to regenerate types after schema changes:
    ```bash
    cd /Users/mnmac/Development/nnshop && npm run typegen
    ```

    This updates src/shared/sanity/types.ts and src/shared/sanity/extract.json with the new sharedSection and sharedSectionRef types.

    If typegen fails due to a schema error, fix the schema files before proceeding.
  </action>
  <verify>
    grep "sharedSection\|SharedSection" src/shared/sanity/types.ts | head -5
  </verify>
  <done>
    - typegen completes without errors
    - types.ts contains sharedSection types
  </done>
</task>

</tasks>

<verification>
After all tasks complete:
1. Open Sanity Studio → should see "Shared Sections" in navigation
2. Create a new Shared Section with an internalTitle and add a brandGrid block
3. Open a page in Studio → pageBuilder → add block → should see "Shared Section" option
4. Select the section you created
5. Confirm frontend renders the block correctly
</verification>

<success_criteria>
- sharedSection document type registered in Sanity schema
- sharedSectionRef object type in pageBuilder array
- GROQ query dereferences sharedSectionRef in HOME_PAGE_QUERY
- HeroPageBuilder renders sharedSectionRef by recursing into section.content
- npm run typegen succeeds
- npm run lint passes
</success_criteria>

<output>
After completion, create `.planning/quick/3-add-reusable-shared-section-block-type-t/3-SUMMARY.md` with what was done.
</output>
