import { defineType } from 'sanity';

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Localized Text',
  type: 'object',
  fields: [
    {
      name: 'en',
      title: 'English',
      type: 'text',
      rows: 3,
    },
    {
      name: 'ua',
      title: 'Ukrainian',
      type: 'text',
      rows: 3,
    },
  ],
});
