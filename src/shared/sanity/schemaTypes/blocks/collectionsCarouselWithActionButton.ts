import { defineType } from 'sanity';

export const collectionsCarousel = defineType({
  name: 'collectionsCarousel',
  title: 'Collections Carousel',
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
    {
      name: 'enable_action',
      title: 'Enable action',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'action_text',
      title: 'Action text',
      type: 'localizedString',
      hidden: ({ parent }) => !parent?.enable_action,
    },
    {
      name: 'action_link',
      title: 'Action link',
      type: 'string',
      hidden: ({ parent }) => !parent?.enable_action,
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title?.en || title?.uk || title?.ru,
        subtitle: 'Collections Carousel',
      };
    },
  },
});
