import { defineField, defineType } from 'sanity';
import { BellIcon } from '@sanity/icons';

export const promotionBannerType = defineType({
  name: 'promotionBanner',
  title: 'Promotion Banner (Popup)',
  type: 'document',
  icon: BellIcon,
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      description: 'Toggle to show or hide the popup banner.',
      initialValue: false,
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'localizedString',
        }),
      ],
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'localizedString',
    }),
    defineField({
      name: 'discountCode',
      title: 'Discount Code',
      type: 'string',
      description: 'Optional. If provided, users can copy it with one click.',
    }),
    defineField({
      name: 'actionButton',
      title: 'Action Button',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'localizedString',
        }),
        defineField({
          name: 'url',
          title: 'Default URL',
          type: 'string',
          description: 'Internal path (e.g. /uk/woman) or external URL.',
        }),
        defineField({
          name: 'womanUrl',
          title: 'Woman URL',
          type: 'string',
          description: 'Optional. If provided, used when gender is woman.',
        }),
        defineField({
          name: 'manUrl',
          title: 'Man URL',
          type: 'string',
          description: 'Optional. If provided, used when gender is man.',
        }),
        defineField({
          name: 'womanCollection',
          title: 'Woman Collection',
          type: 'reference',
          to: [{ type: 'collection' }],
          description: 'Optional. If provided, used to resolve link when gender is woman.',
        }),
        defineField({
          name: 'manCollection',
          title: 'Man Collection',
          type: 'reference',
          to: [{ type: 'collection' }],
          description: 'Optional. If provided, used to resolve link when gender is man.',
        }),
      ],
    }),
    defineField({
      name: 'behavior',
      title: 'Behavior',
      type: 'object',
      fields: [
        defineField({
          name: 'trigger',
          title: 'Trigger',
          type: 'string',
          options: {
            list: [
              { title: 'After delay', value: 'delay' },
              { title: 'On scroll (%)', value: 'scroll' },
              { title: 'On exit intent', value: 'exit_intent' },
            ],
            layout: 'radio',
          },
          initialValue: 'delay',
        }),
        defineField({
          name: 'delaySeconds',
          title: 'Delay (seconds)',
          type: 'number',
          description: 'Used when trigger is "After delay".',
          initialValue: 5,
          hidden: ({ parent }) => parent?.trigger !== 'delay',
        }),
        defineField({
          name: 'scrollPercent',
          title: 'Scroll % to trigger',
          type: 'number',
          description: 'Used when trigger is "On scroll". 0–100.',
          initialValue: 40,
          hidden: ({ parent }) => parent?.trigger !== 'scroll',
          validation: (Rule) => Rule.min(0).max(100),
        }),
        defineField({
          name: 'cooldownHours',
          title: 'Cooldown (hours)',
          type: 'number',
          description: 'How many hours before showing again to the same user. Set 0 to show every session.',
          initialValue: 24,
          validation: (Rule) => Rule.min(0),
        }),
        defineField({
          name: 'showOnce',
          title: 'Show only once ever',
          type: 'boolean',
          description: 'If enabled, the popup is never shown again after the user closes it.',
          initialValue: false,
        }),
        defineField({
          name: 'resetToken',
          title: 'Reset Token (Force Show)',
          type: 'string',
          description: 'Change this value (e.g., "v2", "spring-sale") to show the banner again to users who already dismissed it.',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      enabled: 'enabled',
      uk: 'title.uk',
      ru: 'title.ru',
      media: 'image',
    },
    prepare({ enabled, uk, ru, media }: any) {
      return {
        title: uk || ru || 'Promotion Banner',
        subtitle: enabled ? 'Enabled' : 'Disabled',
        media,
      };
    },
  },
});
