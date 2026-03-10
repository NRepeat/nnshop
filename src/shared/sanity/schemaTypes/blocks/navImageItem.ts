import { defineField, defineType } from 'sanity';

export const navImageItem = defineType({
  name: 'navImageItem',
  title: 'Nav Image Item',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'menuIndex',
      title: 'Menu Index',
      type: 'number',
      description: 'Index of the dropdown menu item (0 = first). If set, overrides array position.',
    }),
    defineField({
      name: 'collection',
      title: 'Collection',
      type: 'reference',
      to: [{ type: 'collection' }],
      description: 'Link to a Shopify collection page (priority over URL)',
    }),
    defineField({
      name: 'brandSlug',
      title: 'Brand Slug',
      type: 'string',
      description: 'Brand slug for /brands/[slug] page (e.g. "nike"). Used if no collection selected.',
    }),
    defineField({
      name: 'url',
      title: 'Link URL',
      type: 'string',
      description: 'Fallback URL if no collection or brand selected (e.g. /woman/new-arrivals)',
    }),
    defineField({
      name: 'imageTitle',
      title: 'Image Title',
      type: 'string',
      description: 'Caption shown below the image',
    }),
    defineField({
      name: 'imageButtonLabel',
      title: 'Image Button Label',
      type: 'string',
      description: 'Button label below image title (e.g. "Все коллекції")',
    }),
    defineField({
      name: 'imageButtonCollection',
      title: 'Image Button Collection',
      type: 'reference',
      to: [{ type: 'collection' }],
      description: 'Link button to a collection page (priority over URL).',
    }),
    defineField({
      name: 'imageButtonUrl',
      title: 'Image Button URL',
      type: 'string',
      description: 'Custom URL for the button (used if no collection selected).',
    }),
  ],
  preview: {
    select: { media: 'image', title: 'collection.store.title', subtitle: 'menuIndex' },
  },
});
