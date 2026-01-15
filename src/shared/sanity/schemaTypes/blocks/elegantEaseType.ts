import { defineType } from 'sanity';

export const elegantEaseType = defineType({
  name: 'elegantEase',
  title: 'Elegant Ease',
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
        subtitle: 'Elegant Ease',
      };
    },
  },
});
