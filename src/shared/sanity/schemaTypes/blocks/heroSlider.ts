export const heroSlideButton = {
  title: 'Hero Slide Button',
  name: 'heroSlideButton',
  type: 'object',
  fields: [
    {
      title: 'Label',
      name: 'label',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      title: 'Link URL',
      name: 'url',
      type: 'url',
      description: 'External or internal URL (e.g. /woman/new-arrivals)',
    },
    {
      name: 'collection',
      title: 'Collection',
      type: 'reference',
      description: 'Link to a collection page (used if URL is not set)',
      to: [{ type: 'collection' }],
    },
    {
      title: 'Style',
      name: 'variant',
      type: 'string',
      options: {
        list: [
          { title: 'Primary (filled)', value: 'default' },
          { title: 'Secondary (light)', value: 'secondary' },
          { title: 'Outline', value: 'outline' },
          { title: 'Ghost', value: 'ghost' },
        ],
        layout: 'radio',
      },
      initialValue: 'secondary',
    },
  ],
  preview: {
    select: { title: 'label', subtitle: 'variant' },
  },
};

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
      title: 'Image (Desktop)',
      name: 'image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      title: 'Image (Mobile)',
      name: 'mobileImage',
      type: 'image',
      description: 'Optional. If set, shown on mobile instead of the desktop image.',
      options: {
        hotspot: true,
      },
    },
    {
      title: 'Buttons',
      name: 'buttons',
      type: 'array',
      description: 'Up to 2 call-to-action buttons',
      of: [{ type: 'heroSlideButton' }],
      validation: (Rule: any) => Rule.max(2),
    },
    {
      title: 'Link (slide-level)',
      name: 'link',
      type: 'linkExternal',
      description: 'Makes the entire slide clickable (used when no buttons are set)',
    },
    {
      name: 'collection',
      title: 'Collection (slide-level)',
      type: 'reference',
      description: 'Makes the entire slide link to a collection (used when no buttons/link are set)',
      to: [{ type: 'collection' }],
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
