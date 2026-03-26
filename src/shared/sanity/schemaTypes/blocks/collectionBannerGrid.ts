import { defineField, defineType } from 'sanity';

export const collectionBannerGrid = defineType({
  name: 'collectionBannerGrid',
  title: 'Collection Banner Grid',
  type: 'object',
  fields: [
    defineField({
      name: 'banners',
      title: 'Banners',
      type: 'array',
      validation: (Rule) => Rule.max(2),
      of: [
        defineField({
          name: 'bannerItem',
          title: 'Banner Item',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'localizedString',
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'localizedString',
                }),
              ],
            }),
            defineField({
              name: 'collection',
              title: 'Collection',
              type: 'reference',
              to: [{ type: 'collection' }],
            }),
            defineField({
              name: 'customUrl',
              title: 'Custom URL',
              type: 'string',
              description:
                'Internal link (e.g. /woman/sale). Overrides the collection reference above.',
            }),
          ],
          preview: {
            select: {
              title: 'title.uk',
              media: 'image',
            },
            prepare({ title, media }) {
              return { title: title || 'Banner', media };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Collection Banner Grid' };
    },
  },
});
