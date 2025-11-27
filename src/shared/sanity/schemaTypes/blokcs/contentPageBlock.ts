import { defineField, defineType } from 'sanity';

export const contentPageBlock = defineType({
  name: 'contentPageBlock',
  title: 'Content Page Block',
  type: 'object',
  fields: [
    defineField({
      name: 'body',
      type: 'localizedBlockContent',
      title: 'Body',
    }),
  ],
});
