import { defineField, defineType, defineArrayMember } from 'sanity';
import { ImageIcon } from '@sanity/icons';

export const navDropdownImages = defineType({
  name: 'navDropdownImages',
  title: 'Navigation Dropdown Images',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'woman',
      title: 'Woman',
      description: 'Images shown in woman navigation dropdowns, matched by menu index.',
      type: 'array',
      of: [defineArrayMember({ type: 'navImageItem' })],
    }),
    defineField({
      name: 'man',
      title: 'Man',
      description: 'Images shown in man navigation dropdowns, matched by menu index.',
      type: 'array',
      of: [defineArrayMember({ type: 'navImageItem' })],
    }),
  ],
});
