import { defineField, defineType } from 'sanity';
import { TextIcon } from '@sanity/icons';

export const topicType = defineType({
  name: 'topic',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'text',
      type: 'text',
    }),
  ],
  icon: TextIcon,
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title,
        subtitle: 'Topic',
        media: TextIcon,
      };
    },
  },
});
