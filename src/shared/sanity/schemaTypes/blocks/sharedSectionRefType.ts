import { defineType, defineField } from 'sanity';
import { ComponentIcon } from '@sanity/icons';

export const sharedSectionRef = defineType({
  name: 'sharedSectionRef',
  title: 'Shared Section',
  type: 'object',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'section',
      title: 'Section',
      type: 'reference',
      to: [{ type: 'sharedSection' }],
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {
      title: 'section.internalTitle',
    },
    prepare({ title }) {
      return {
        title: title ?? 'No section selected',
        subtitle: 'Shared Section',
      };
    },
  },
});
