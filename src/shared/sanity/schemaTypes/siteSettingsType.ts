import { defineField, defineType, defineArrayMember } from 'sanity';
import { ControlsIcon } from '@sanity/icons';

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: ControlsIcon,
  fields: [
    defineField({
      name: 'infoBar',
      type: 'infoBar',
    }),
    defineField({
      name: 'header',
      type: 'header',
    }),
    defineField({
      name: 'brandsNavigation',
      title: 'Brands Navigation',
      description: 'Configure the brands dropdown in the navigation bar.',
      type: 'brandsNavigation',
    }),
    defineField({
      name: 'navImages',
      title: 'Navigation Dropdown Images',
      description: 'Images per gender shown in navigation dropdowns, matched by index to sub-menu items.',
      type: 'object',
      fields: [
        defineField({
          name: 'woman',
          title: 'Woman',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({
                  name: 'image',
                  title: 'Image',
                  type: 'image',
                  options: { hotspot: true },
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'menuIndex',
                  title: 'Menu Index',
                  type: 'number',
                  description: 'Index of the dropdown menu item (0 = first). If set, overrides array position.',
                }),
                defineField({
                  name: 'collection',
                  title: 'Collection',
                  type: 'reference',
                  to: [{ type: 'collection' }],
                  description: 'Link to a Shopify collection page (priority over URL)',
                }),
                defineField({
                  name: 'url',
                  title: 'Link URL',
                  type: 'string',
                  description: 'Fallback URL if no collection selected (e.g. /woman/new-arrivals)',
                }),
              ],
              preview: { select: { media: 'image', title: 'collection.store.title', subtitle: 'menuIndex' } },
            }),
          ],
        }),
        defineField({
          name: 'man',
          title: 'Man',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({
                  name: 'image',
                  title: 'Image',
                  type: 'image',
                  options: { hotspot: true },
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'menuIndex',
                  title: 'Menu Index',
                  type: 'number',
                  description: 'Index of the dropdown menu item (0 = first). If set, overrides array position.',
                }),
                defineField({
                  name: 'collection',
                  title: 'Collection',
                  type: 'reference',
                  to: [{ type: 'collection' }],
                  description: 'Link to a Shopify collection page (priority over URL)',
                }),
                defineField({
                  name: 'url',
                  title: 'Link URL',
                  type: 'string',
                  description: 'Fallback URL if no collection selected (e.g. /man/new-arrivals)',
                }),
              ],
              preview: { select: { media: 'image', title: 'collection.store.title', subtitle: 'menuIndex' } },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'footerSettings',
      type: 'footerSettings',
    }),
    // defineField({
    //   name: 'homePageWoman',
    //   type: 'reference',
    //   to: [{ type: 'page' }],
    // }),
    // defineField({
    //   name: 'homePageMan',
    //   type: 'reference',
    //   to: [{ type: 'page' }],
    // }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      };
    },
  },
});
