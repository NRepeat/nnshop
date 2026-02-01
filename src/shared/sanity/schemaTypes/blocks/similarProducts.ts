import { defineType } from 'sanity';

export const similarProducts = defineType({
  name: 'similarProducts',
  title: 'Similar Products',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'localizedString',
    },
    {
      name: 'collection',
      title: 'Collection',
      type: 'reference',
      to: [{ type: 'collection' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title.en,
        subtitle: 'Similar Products',
      };
    },
  },
});
