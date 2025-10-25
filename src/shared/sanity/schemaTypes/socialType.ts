import { defineField, defineType } from 'sanity';

export const socialType = defineType({
  name: 'social',
  title: 'Social',
  type: 'object',
  fields: [
    defineField({
      name: 'linkedIn',
      title: 'LinkedIn',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'x',
      description: 'Formerly known as Twitter',
      type: 'text',
      rows: 2,
    }),
  ],
});
