import { defineField, defineType } from 'sanity';
import { TagIcon } from '@sanity/icons';

export const brandsNavigation = defineType({
  name: 'brandsNavigation',
  title: 'Brands Navigation',
  type: 'object',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'tabTitle',
      title: 'Tab Title',
      type: 'localizedString',
      description: 'Назва табу "Бренди" в шапці сайту (uk/ru)',
    }),
    defineField({
      name: 'topBrandsWoman',
      title: 'Top Brands — Woman',
      description: 'Бренди для жіночої навігації (max 20). Точні назви як в Shopify.',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.max(20),
    }),
    defineField({
      name: 'topBrandsMan',
      title: 'Top Brands — Man',
      description: 'Бренди для чоловічої навігації (max 20). Точні назви як в Shopify.',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.max(20),
    }),
    defineField({
      name: 'collections',
      title: 'Collections',
      description: 'Collection links to display in the left column of the "Brands" dropdown.',
      type: 'array',
      of: [{ type: 'linkInternal' }],
      validation: (Rule) => Rule.max(10),
    }),
  ],
});
