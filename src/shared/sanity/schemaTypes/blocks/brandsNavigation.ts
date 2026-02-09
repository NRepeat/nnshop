import { defineField, defineType } from 'sanity';
import { TagIcon } from '@sanity/icons';

export const brandsNavigation = defineType({
  name: 'brandsNavigation',
  title: 'Brands Navigation',
  type: 'object',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'topBrands',
      title: 'Top Brands',
      description: 'Brand names to display in the "Brands" dropdown (max 20). Enter exact brand names as they appear in Shopify.',
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
