import { defineType } from 'sanity';

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Localized String',
  type: 'object',
  fields: [
    {
      name: 'ru',
      title: 'Ru',
      type: 'string',
    },
    {
      name: 'uk',
      title: 'Ukrainian',
      type: 'string',
    },
  ],
});
