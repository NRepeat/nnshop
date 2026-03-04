import { defineField, defineType } from 'sanity';
import { HelpCircleIcon } from '@sanity/icons';
export const faqsType = defineType({
  name: 'faqs',
  title: 'FAQs / Icon Benefits',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'localizedString',
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        defineField({
          name: 'item',
          title: 'Item',
          type: 'object',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'image',
              options: { hotspot: false },
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'localizedString',
            }),
          ],
          preview: {
            select: { label: 'label' },
            prepare({ label }) {
              return { title: label?.uk || label?.ru || 'Item' };
            },
          },
        }),
      ],
    }),
  ],
  icon: HelpCircleIcon,
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title?.uk || title?.ru || 'FAQs',
        subtitle: 'FAQs / Icon Benefits',
      };
    },
  },
});
