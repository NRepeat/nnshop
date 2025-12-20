import { defineField, defineType } from 'sanity';
import { ControlsIcon } from '@sanity/icons';

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: ControlsIcon,
  fields: [
    defineField({
      name: 'homePageWoman',
      type: 'reference',
      to: [{ type: 'page' }],
    }),
    defineField({
      name: 'homePageMan',
      type: 'reference',
      to: [{ type: 'page' }],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      };
    },
  },
});
