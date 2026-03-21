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
      name: 'navDropdowns',
      title: 'Navigation Dropdown Columns',
      description:
        'Menu tabs + dropdown columns per gender. Each entry = one nav tab (Взуття, Одяг…).',
      type: 'object',
      fields: (['woman', 'man'] as const).map((gender) =>
        defineField({
          name: gender,
          title: gender === 'woman' ? 'Woman' : 'Man',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              title: 'Nav Tab',
              fields: [
                defineField({
                  name: 'tabTitle',
                  title: 'Tab Title',
                  type: 'localizedString',
                  description: 'Назва табу в шапці сайту (uk/ru)',
                }),
                defineField({
                  name: 'tabCollection',
                  title: 'Tab Collection',
                  type: 'reference',
                  to: [{ type: 'collection' }],
                  description: 'Колекція, на яку веде клік по табу (не потрібно для бренд-табу)',
                }),
                defineField({
                  name: 'tabUrl',
                  title: 'Tab URL (override)',
                  type: 'string',
                  description: 'Прямий URL якщо немає колекції. Наприклад /brands для бренд-табу.',
                }),
                defineField({
                  name: 'isBrandsTab',
                  title: 'Brands Tab',
                  type: 'boolean',
                  description: 'Увімкни якщо цей таб — "Бренди". Замість колонок рендериться алфавітний дропдаун.',
                  initialValue: false,
                }),
                defineField({
                  name: 'topBrands',
                  title: 'Top Brands',
                  type: 'array',
                  of: [{ type: 'reference', to: [{ type: 'collection' }] }],
                  description: 'Посилання на колекції брендів (тільки для Brands Tab).',
                  hidden: ({ parent }: any) => !parent?.isBrandsTab,
                }),
                defineField({
                  name: 'tabImage',
                  title: 'Dropdown Image',
                  type: 'navImageItem',
                  description: 'Зображення що відображається праворуч у дропдауні цього табу',
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
                select: { uk: 'tabTitle.uk', ru: 'tabTitle.ru' },
                prepare({ uk, ru }: any) {
                  return { title: uk || ru || 'Tab' };
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
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      };
    },
  },
});
