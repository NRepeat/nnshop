import { defineType } from 'sanity';

export const productCommentsType = defineType({
  name: 'productComments',
  title: 'Product Comments',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
  ],
});
