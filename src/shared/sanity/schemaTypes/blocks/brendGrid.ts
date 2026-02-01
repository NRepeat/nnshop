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
