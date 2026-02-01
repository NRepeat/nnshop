import { defineType } from 'sanity';

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Localized Text',
  type: 'object',
  fields: [
    {
      name: 'ru',
      title: 'Russian',
      type: 'text',
      rows: 3,
    },
    {
      name: 'uk',
      title: 'Ukrainian',
      type: 'text',
      rows: 3,
    },
  ],
});
