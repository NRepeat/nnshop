import { defineType } from 'sanity';

export const productCommentsType = defineType({
  name: 'productComments',
  title: 'Product Comments',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'localizedString',
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title?.en || title?.uk || title?.ru,
        subtitle: 'Product Comments',
      };
    },
  },
});
