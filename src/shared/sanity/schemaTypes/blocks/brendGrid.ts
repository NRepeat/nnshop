import { ImageIcon } from '@sanity/icons';
import { defineField } from 'sanity';
import { defineType } from 'sanity';

export const brandGridBlock = defineType({
  name: 'brandGridBlock',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'localizedString',
    }),
    defineField({
      name: 'barnds',
      type: 'array',
      of: [
        defineField({
          type: 'image',
          icon: ImageIcon,
          options: { hotspot: true },
          name: 'logo',
          fields: [
            defineField({
              name: 'alt',
              type: 'localizedString',
              title: 'Alt Text',
            }),
            defineField({
              type: 'slug',
              name: 'handle',
            }),            {
              name: 'collection',
              title: 'Collection',
              type: 'reference',
              to: [{ type: 'collection' }],
            },
            defineField({
              name: 'isBrandCollection',
              title: 'Is brand collection',
              type: 'boolean',
              description: 'If checked, the link will use /brand/{collection-handle} instead of the regular collection URL.',
              initialValue: true,
            }),
          ],
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
        subtitle: 'Brand Grid Block',
      };
    },
  },
});
