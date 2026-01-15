import { defineType } from 'sanity';

export const productCarousel = defineType({
  name: 'productCarousel',
  title: 'Product Carousel',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'localizedString',
    },
    // {
    //   name: 'products',
    //   title: 'Products',
    //   type: 'array',
    //   of: [{ type: 'reference', to: [{ type: 'product' }] }],
    // },
    {
      name: 'collection',
      title: 'Collection',
      type: 'reference',
      to: [{ type: 'collection' }],
    },

    // {
    //   name: 'enableAction',
    //   title: 'Enable Action',
    //   type: 'boolean',
    // },
    // {
    //   name: 'actionName',
    //   title: 'Action Name',
    //   type: 'localizedString',
    //   hidden: ({ parent }) => !parent?.enableAction,
    // },
    // {
    //   name: 'actionLink',
    //   title: 'Action Link',
    //   type: 'localizedString',
    //   hidden: ({ parent }) => !parent?.enableAction,
    // },
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title.en,
        subtitle: 'Product Carousel',
      };
    },
  },
});
