import { defineType } from 'sanity';

export const mainCollectionGrid = defineType({
  name: 'mainCollectionGrid',
  title: 'Main Collection Grid',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'localizedString',
    },
    {
      name: 'collections',
      title: 'Collections',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'collection' }] }],
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title.en,
        subtitle: 'Main Collection Grid',
      };
    },
  },
});
