import { defineArrayMember, defineField } from 'sanity';

export const sliderBlock = defineField({
  name: 'sliderBlock',
  type: 'object',
  fields: [
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
              name: 'backgroundImage',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),

            defineField({
              name: 'link',
              type: 'array',
              of: [{ type: 'linkInternal' }, { type: 'linkExternal' }],
              validation: (Rule) => Rule.max(1),
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'slides[0].title',
      media: 'slides[0].backgroundImage',
    },
    prepare({ title, media }) {
      return {
        title: title?.en,
        subtitle: 'Slider',
        media: media,
      };
    },
  },
});
