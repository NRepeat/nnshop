import { defineField, defineType } from 'sanity';

export const footerSettings = defineType({
  name: 'footerSettings',
  title: 'Footer',
  type: 'object',
  options: {
    collapsed: false,
    collapsible: true,
  },
  fields: [
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'TikTok', value: 'tiktok' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'Telegram', value: 'telegram' },
                  { title: 'Viber', value: 'viber' },
                ],
              },
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
            }),
          ],
          preview: {
            select: { title: 'platform', subtitle: 'url' },
          },
        },
      ],
    }),
    defineField({
      name: 'workingHours',
      title: 'Working Hours',
      type: 'object',
      fields: [
        defineField({ name: 'uk', title: 'Ukrainian', type: 'string' }),
        defineField({ name: 'ru', title: 'Russian', type: 'string' }),
      ],
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      fields: [
        defineField({ name: 'uk', title: 'Ukrainian', type: 'string' }),
        defineField({ name: 'ru', title: 'Russian', type: 'string' }),
      ],
    }),
    defineField({
      name: 'paymentMethods',
      title: 'Accepted Payment Methods',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Visa', value: 'visa' },
          { title: 'Mastercard', value: 'mastercard' },
          { title: 'LiqPay', value: 'liqpay' },
          { title: 'NovaPay', value: 'novapay' },
          { title: 'Mono', value: 'mono' },
        ],
      },
    }),
  ],
});
