import { defineType } from 'sanity';

export const localizedSimpleBlockContent = defineType({
  name: 'localizedSimpleBlockContent',
  title: 'Localized Simple Block Content',
  type: 'object',
  fields: [
    {
      name: 'ru',
      title: 'Ru',
      type: 'simpleBlockContent',
    },
    {
      name: 'uk',
      title: 'Ukrainian',
      type: 'simpleBlockContent',
    },
  ],
});
