import { defineType } from 'sanity';

export const headerType = defineType({
  name: 'header',
  type: 'object',
  fields: [
    {
      name: 'mainCategory',
      type: 'array',
      title: 'Category links',
      description: 'The category links to display in the header.',
      of: [{ type: 'linkInternal' }],
    },
    {
      name: 'categoryLinks',
      type: 'array',
      title: 'Category links',
      description: 'The category links to display in the header.',
      of: [{ type: 'linkInternal' }],
    },
    {
      name: 'icon',
      type: 'image',
      title: 'Icon',
      description: 'The icon to display in the header.',
    },
  ],
});
