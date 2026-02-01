export const heroSlide = {
  title: 'Hero Slide',
  name: 'heroSlide',
  type: 'object',
  fields: [
    {
      title: 'Description',
      name: 'description',
      type: 'text',
    },
    {
      title: 'Image',
      name: 'image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      title: 'Link',
      name: 'link',
      type: 'linkExternal',
    },
  ],
};

export const heroSlider = {
  title: 'Hero Slider',
  name: 'heroSlider',
  type: 'object',
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
    },
    {
      title: 'Description',
      name: 'description',
      type: 'text',
    },
    {
      name: 'slides',
      title: 'Slides',
      type: 'array',
      of: [{ type: 'heroSlide' }],
    },
  ],
  // preview: {
  //   select: {
  //     title: 'title',
  //   },
  //   prepare({ title }) {
  //     return {
  //       title: title,
  //       subtitle: 'Slides',
  //     };
  //   },
  // },
};
