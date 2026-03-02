import { ImageIcon } from '@sanity/icons';
import { defineField } from 'sanity';
import { defineType } from 'sanity';

export const collectionsWithPreviews = defineType({
  name: 'collectionsWithPreviews',
  type: 'object',

  fields: [
    defineField({
      name: 'title',
      type: 'localizedString',
    }),
    defineField({
      name: 'collectionName',
      type: 'string',
    }),
    defineField({
      name: 'previews',
      type: 'array',
      of: [
        defineField({
          type: 'image',
          icon: ImageIcon,
          options: { hotspot: true },
          name: 'preview',
          fields: [
            defineField({
              type: 'slug',
              name: 'handle',
            }),
          ],
        }),
      ],
      options: {
        layout: 'grid',
      },
    }),
    defineField({
      name: 'collections',
      type: 'array',
      of: [
        defineField({
          name: 'collectionItem',
          title: 'Collection Item',
          type: 'object',
          fields: [
            defineField({
              name: 'collection',
              title: 'Collection',
              type: 'reference',
              to: [{ type: 'collection' }],
            }),
            defineField({
              name: 'customTitle',
              title: 'Custom Title',
              type: 'localizedString',
              description: 'Overrides the Shopify collection title in the carousel',
            }),
          ],
          preview: {
            select: {
              title: 'collection.store.title',
              customTitle: 'customTitle',
            },
            prepare({ title, customTitle }) {
              return {
                title: customTitle?.uk || customTitle?.ru || title || 'Collection',
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title?.en || title?.uk || title?.ru,
        subtitle: 'Collections With Previews',
      };
    },
  },
});
