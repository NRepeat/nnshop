import { defineType } from 'sanity';

export const localizedBlockContent = defineType({
  name: 'localizedBlockContent',
  title: 'Localized Block Content',
  type: 'object',
  fields: [
    {
      name: 'en',
      title: 'English',
      type: 'blockContent',
    },
    {
      name: 'uk',
      title: 'Ukrainian',
      type: 'blockContent',
    },
  ],
});
