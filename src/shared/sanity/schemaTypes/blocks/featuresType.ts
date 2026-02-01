import { defineField, defineType } from 'sanity';
import { StarIcon } from '@sanity/icons';
export const featuresType = defineType({
  name: 'features',
  type: 'object',
  fields: [
    {
      name: 'title',
      type: 'localizedString',
    },
    defineField({
      name: 'features',
      type: 'array',
      of: [
        defineField({
          name: 'feature',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              type: 'localizedString',
            }),
            defineField({
              name: 'text',
              type: 'localizedText',
            }),
          ],
        }),
      ],
    }),
  ],
  icon: StarIcon,
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title?.en || title?.uk || title?.ru,
        subtitle: 'Features',
      };
    },
  },
});
