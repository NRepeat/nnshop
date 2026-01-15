import { defineField, defineType } from 'sanity';

export const productDetailsType = defineType({
  name: 'productDetails',
  title: 'Product Details',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
    }),
    defineField({
      name: 'details',
      title: 'Details',
      type: 'array',
      of: [
        defineField({
          name: 'detail',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
            }),
            defineField({
              name: 'heading',
              type: 'string',
            }),
            defineField({
              name: 'text',
              type: 'text',
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title?.en || title?.uk || title?.ru,
        subtitle: 'Product Details',
      };
    },
  },
});
