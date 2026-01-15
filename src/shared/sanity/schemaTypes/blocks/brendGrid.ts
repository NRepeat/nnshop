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
});
