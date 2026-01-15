import { defineType } from 'sanity';

export const mainCollectionGrid = defineType({
  name: 'mainCollectionGrid',
  title: 'Main Collection Grid',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'localizedText',
    },
    {
      name: 'collections',
      title: 'Collections',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'collection' }] }],
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Main Collection Grid',
      };
    },
  },
});
