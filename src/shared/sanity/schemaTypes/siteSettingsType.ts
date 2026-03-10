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
      type: 'navDropdownImages',
    }),
    defineField({
      name: 'navDropdowns',
      title: 'Navigation Dropdown Columns',
      description:
        'Custom columns for navigation dropdowns per gender. If set, overrides Shopify menu structure.',
      type: 'object',
      fields: (['woman', 'man'] as const).map((gender) =>
        defineField({
          name: gender,
          title: gender === 'woman' ? 'Woman' : 'Man',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              title: 'Dropdown',
              fields: [
                defineField({
                  name: 'menuIndex',
                  title: 'Menu Index',
                  type: 'number',
                  description: '0 = first dropdown (e.g. Взуття), 1 = second, etc.',
                  validation: (Rule) => Rule.required().min(0),
                }),
                defineField({
                  name: 'columns',
                  title: 'Columns (max 2)',
                  type: 'array',
                  validation: (Rule) => Rule.max(2),
                  of: [
                    defineArrayMember({
                      type: 'object',
                      title: 'Column',
                      fields: [
                        defineField({
                          name: 'collection',
                          title: 'Collection (header link)',
                          type: 'reference',
                          to: [{ type: 'collection' }],
                          description: 'Collection the column header links to',
                        }),
                        defineField({
                          name: 'title',
                          title: 'Title override',
                          type: 'localizedString',
                          description: 'Override the collection title. Leave empty to use collection name.',
                        }),
                        defineField({
                          name: 'items',
                          title: 'Items',
                          type: 'array',
                          of: [
                            defineArrayMember({
                              type: 'reference',
                              to: [{ type: 'collection' }],
                            }),
                          ],
                        }),
                        defineField({
                          name: 'outletLink',
                          title: 'Outlet / Special Link',
                          type: 'object',
                          description: 'Highlighted link shown at the bottom of the column (e.g. Outlet, Sale). Styled in red.',
                          fields: [
                            defineField({
                              name: 'label',
                              title: 'Label',
                              type: 'localizedString',
                            }),
                            defineField({
                              name: 'collection',
                              title: 'Collection',
                              type: 'reference',
                              to: [{ type: 'collection' }],
                              description: 'Link to a Shopify collection page (priority over URL).',
                            }),
                            defineField({
                              name: 'url',
                              title: 'URL',
                              type: 'string',
                              description: 'Custom URL if no collection selected.',
                            }),
                          ],
                        }),
                        defineField({
                          name: 'actionButton',
                          title: 'Action Button',
                          type: 'object',
                          description: 'Button shown below the column items. Leave empty to hide.',
                          fields: [
                            defineField({
                              name: 'label',
                              title: 'Button Label',
                              type: 'localizedString',
                            }),
                            defineField({
                              name: 'collection',
                              title: 'Collection',
                              type: 'reference',
                              to: [{ type: 'collection' }],
                              description: 'Link button to a collection page (priority over URL).',
                            }),
                            defineField({
                              name: 'url',
                              title: 'Button URL',
                              type: 'string',
                              description: 'Custom URL. Used if no collection selected.',
                            }),
                          ],
                        }),
                      ],
                      preview: {
                        select: { colTitle: 'collection.store.title', uk: 'title.uk', ru: 'title.ru' },
                        prepare({ colTitle, uk, ru }: any) {
                          return { title: uk || ru || colTitle || '—' };
                        },
                      },
                    }),
                  ],
                }),
              ],
              preview: {
                select: { index: 'menuIndex' },
                prepare({ index }: any) {
                  return { title: `Dropdown #${index}` };
                },
              },
            }),
          ],
        }),
      ),
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
