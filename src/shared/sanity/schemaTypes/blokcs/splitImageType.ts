import { defineField, defineType } from 'sanity';
import { BlockContentIcon } from '@sanity/icons';
export const splitImageType = defineType({
  name: 'splitImage',
  type: 'object',
  fields: [
    defineField({
      name: 'orientation',
      type: 'string',
      options: {
        list: [
          { value: 'imageLeft', title: 'Image Left' },
          { value: 'imageRight', title: 'Image Right' },
        ],
      },
    }),
    defineField({
      name: 'title',
      type: 'localizedString',
    }),
    defineField({
      name: 'link',
      type: 'array',
      of: [{ type: 'linkInternal' }, { type: 'linkExternal' }],
      validation: (Rule) => Rule.max(1),
    }),
    defineField({
      name: 'image',
      type: 'image',
    }),
  ],
  icon: BlockContentIcon,
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
    prepare({ title, media }) {
      return {
        title: title.en,
        subtitle: 'Split Image',
        media: media ?? BlockContentIcon,
      };
    },
  },
});
