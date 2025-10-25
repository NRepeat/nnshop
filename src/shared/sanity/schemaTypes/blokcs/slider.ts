import { defineArrayMember, defineField } from 'sanity';

export const sliderBlock = defineField({
  name: 'sliderBlock',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'localizedText',
    }),
    defineField({
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'backgroundImage',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'slides',
      title: 'Hero Slides',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'slide',
          fields: [
            defineField({
              name: 'title',
              type: 'localizedString',
            }),
            defineField({
              name: 'description',
              type: 'localizedText',
            }),
            defineField({
              name: 'backgroundImage',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),

            defineField({
              name: 'backgroundOverlay',
              title: 'Background Overlay',
              type: 'object',
              fields: [
                defineField({
                  name: 'enabled',
                  title: 'Enable Overlay',
                  type: 'boolean',
                  initialValue: true,
                  description:
                    'Add overlay to background image for better text readability',
                }),
                defineField({
                  name: 'color',
                  title: 'Overlay Color',
                  type: 'color',
                  initialValue: {},
                  description: 'Color of the background overlay',
                }),
                defineField({
                  name: 'opacity',
                  title: 'Overlay Opacity',
                  type: 'number',
                  initialValue: 0.4,
                  validation: (Rule) => Rule.min(0).max(1),
                  description:
                    'Opacity of the background overlay (0 = transparent, 1 = opaque)',
                }),
              ],
            }),
            // defineField({
            //   name: 'link',
            //   type: 'array',
            //   of: [{ type: 'linkInternal' }, { type: 'linkExternal' }],
            //   validation: (Rule) => Rule.max(1),
            // }),
          ],
        }),
      ],
    }),
  ],
});
