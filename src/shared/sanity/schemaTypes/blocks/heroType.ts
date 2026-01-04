import { defineField, defineType } from 'sanity';
import { TextIcon } from '@sanity/icons';

export const heroType = defineType({
  name: 'hero',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'text',
    }),
    defineField({
      name: 'text',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'image',
      type: 'image',
    }),
    defineField({
      name: 'buttonText',
      type: 'string',
    }),
    defineField({
      name: 'buttonLink',
      type: 'string',
    }),
  ],
  icon: TextIcon,
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
    prepare({ title, media }) {
      return {
        title,
        subtitle: 'Hero',
        media: media ?? TextIcon,
      };
    },
  },
});
