import { defineType } from 'sanity';

export const elegantEaseType = defineType({
  name: 'elegantEase',
  title: 'Elegant Ease',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
  ],
});
