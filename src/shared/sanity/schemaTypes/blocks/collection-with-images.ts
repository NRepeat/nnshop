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
          name: 'collection',
          title: 'Collection',
          type: 'reference',
          to: [{ type: 'collection' }],
        }),
      ],
      options: {
        layout: 'grid',
      },
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
