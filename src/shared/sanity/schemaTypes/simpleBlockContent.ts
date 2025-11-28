// ./schemaTypes/simpleBlockContent.ts
import { defineType } from 'sanity';

export default defineType({
  name: 'simpleBlockContent',
  type: 'array',
  of: [
    {
      title: 'Block',
      type: 'block',
      styles: [{ title: 'Normal', value: 'normal' }],
      lists: [],
    },
  ],
});
