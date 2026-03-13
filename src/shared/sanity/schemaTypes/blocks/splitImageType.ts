import { defineField, defineType } from 'sanity';
import { BlockContentIcon } from '@sanity/icons';

const textPositionOptions = {
  list: [
    { title: '↖ Top Left',      value: 'top-left' },
    { title: '↑ Top Center',    value: 'top-center' },
    { title: '↗ Top Right',     value: 'top-right' },
    { title: '← Middle Left',   value: 'middle-left' },
    { title: '· Middle Center', value: 'middle-center' },
    { title: '→ Middle Right',  value: 'middle-right' },
    { title: '↙ Bottom Left',   value: 'bottom-left' },
    { title: '↓ Bottom Center', value: 'bottom-center' },
    { title: '↘ Bottom Right',  value: 'bottom-right' },
  ],
  layout: 'radio' as const,
};

export const splitImageType = defineType({
  name: 'splitImage',
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'style',   title: 'Style' },
    { name: 'media',   title: 'Media' },
  ],
  fields: [
    defineField({
      name: 'orientation',
      title: 'Orientation',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { value: 'imageLeft',  title: 'Image Left' },
          { value: 'imageRight', title: 'Image Right' },
        ],
      },
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      group: 'content',
    }),
    {
      name: 'collection',
      title: 'Collection',
      type: 'reference',
      group: 'content',
      to: [{ type: 'collection' }],
    },
    defineField({
      name: 'description',
      title: 'Description',
      type: 'localizedString',
      group: 'content',
      description: 'Replaces the collection name shown as button text',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      group: 'media',
    }),
    defineField({
      name: 'textPosition',
      title: 'Text Position',
      type: 'string',
      group: 'style',
      description: 'Position of the text overlay on the image',
      initialValue: 'bottom-left',
      options: textPositionOptions,
    }),
    defineField({
      name: 'titleColor',
      title: 'Title Color',
      type: 'color',
      group: 'style',
      options: { disableAlpha: true },
    }),
    defineField({
      name: 'descriptionColor',
      title: 'Description Color',
      type: 'color',
      group: 'style',
      options: { disableAlpha: true },
    }),
    defineField({
      name: 'overlay',
      title: 'Image Overlay',
      type: 'object',
      group: 'style',
      fields: [
        {
          title: 'Color',
          name: 'color',
          type: 'color',
          options: { disableAlpha: true },
        },
        {
          title: 'Opacity (%)',
          name: 'opacity',
          type: 'number',
          initialValue: 30,
          validation: (Rule: any) => Rule.min(0).max(100),
          options: { slider: true },
        },
      ],
    }),
    defineField({
      name: 'textBackground',
      title: 'Text Background',
      type: 'object',
      group: 'style',
      description: 'Semi-transparent background behind the text block',
      fields: [
        {
          title: 'Color',
          name: 'color',
          type: 'color',
          options: { disableAlpha: true },
        },
        {
          title: 'Opacity (%)',
          name: 'opacity',
          type: 'number',
          initialValue: 40,
          validation: (Rule: any) => Rule.min(0).max(100),
          options: { slider: true },
        },
        {
          title: 'Padding',
          name: 'padding',
          type: 'string',
          initialValue: 'md',
          options: {
            list: [
              { title: 'Small',  value: 'sm' },
              { title: 'Medium', value: 'md' },
              { title: 'Large',  value: 'lg' },
            ],
            layout: 'radio',
          },
        },
        {
          title: 'Rounded corners',
          name: 'rounded',
          type: 'boolean',
          initialValue: false,
        },
      ],
    }),
  ],
  icon: BlockContentIcon,
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
    prepare({ title, media }) {
      return {
        title: title.en,
        subtitle: 'Split Image',
        media: media ?? BlockContentIcon,
      };
    },
  },
});
