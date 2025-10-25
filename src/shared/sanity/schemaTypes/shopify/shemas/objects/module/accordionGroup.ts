import blocksToText from '@/shared/sanity/utils/shopify/blocksToText';
import { defineField } from 'sanity';

export default defineField({
  name: 'accordionGroup',
  title: 'Object',
  type: 'object',
  icon: false,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'accordionBody',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      body: 'body',
      title: 'title',
    },
    prepare(selection) {
      const { body, title } = selection;
      return {
        subtitle: body && blocksToText(body),
        title,
      };
    },
  },
});
