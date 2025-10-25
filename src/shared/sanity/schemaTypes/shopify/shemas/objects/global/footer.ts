import { defineField } from 'sanity';

export default defineField({
  name: 'footerSettings',
  title: 'Footer',
  type: 'object',
  options: {
    collapsed: false,
    collapsible: true,
  },
  fields: [
    // Links

    // Text
    defineField({
      name: 'text',
      title: 'Text',
      type: 'array',
      of: [
        {
          lists: [],
          marks: {
            annotations: [],
            decorators: [],
          },
          // Block styles
          styles: [{ title: 'Normal', value: 'normal' }],
          type: 'block',
        },
      ],
    }),
  ],
});
