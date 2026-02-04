import React from 'react';
import { defineField, defineType } from 'sanity';
import { PackageIcon } from '@sanity/icons';
import { getExtension } from '@sanity/asset-utils';
import pluralize from 'pluralize-esm';
import ShopifyIcon from '@/shared/sanity/components/shopify/icons/Shopify';
import CollectionHiddenInput from '@/shared/sanity/components/shopify/inputs/CollectionHidden';
import ShopifyDocumentStatus from '@/shared/sanity/components/shopify/media/ShopifyDocumentStatus';

const GROUPS = [
  {
    name: 'theme',
    title: 'Theme',
  },
  {
    default: true,
    name: 'editorial',
    title: 'Editorial',
  },
  {
    name: 'shopifySync',
    title: 'Shopify sync',
    icon: ShopifyIcon,
  },
];

export default defineType({
  name: 'collection',
  title: 'Collection',
  type: 'document',
  icon: PackageIcon,
  groups: GROUPS,
  fields: [
    // Product hidden status
    defineField({
      name: 'hidden',
      type: 'string',
      components: {
        field: CollectionHiddenInput,
      },
      hidden: ({ parent }) => {
        const isDeleted = parent?.store?.isDeleted;
        return !isDeleted;
      },
    }),
    // Title (proxy)
    defineField({
      name: 'titleProxy',
      title: 'Title',
      type: 'proxyString',
      options: { field: 'store.title' },
    }),
    // Slug (proxy)
    defineField({
      name: 'slugProxy',
      title: 'Slug',
      type: 'proxyString',
      options: { field: 'store.slug.current' },
    }),

    // Vector
    defineField({
      name: 'vector',
      title: 'Vector artwork',
      type: 'image',
      description: 'Displayed in collection links using color theme',
      // options: {
      //   accept: 'image/svg+xml',
      // },
      group: 'theme',
    }),
    // Show hero
    defineField({
      name: 'showHero',
      title: 'Show hero',
      type: 'boolean',
      description: 'If disabled, page title will be displayed instead',
      group: 'editorial',
    }),
    // Hero
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'hero.collection',
      hidden: ({ document }) => !document?.showHero,
      group: 'editorial',
    }),
    // Modules
    defineField({
      name: 'modules',
      title: 'Modules',
      type: 'array',
      description: 'Editorial modules to associate with this collection',
      of: [
        { type: 'module.callout' },
        { type: 'module.callToAction' },
        { type: 'module.image' },
        { type: 'module.instagram' },
      ],
      group: 'editorial',
    }),
    // Shopify collection
    defineField({
      name: 'store',
      title: 'Shopify',
      type: 'shopifyCollection',
      description: 'Collection data from Shopify (read-only)',
      group: 'shopifySync',
    }),
    // Localized handles
    defineField({
      name: 'handles',
      title: 'Localized Handles',
      type: 'object',
      group: 'shopifySync',
      readOnly: true,
      fields: [
        defineField({
          name: 'uk',
          title: 'Ukrainian',
          type: 'string',
        }),
        defineField({
          name: 'ru',
          title: 'Russian',
          type: 'string',
        }),
      ],
    }),
    // Localized titles
    defineField({
      name: 'titles',
      title: 'Localized Titles',
      type: 'object',
      group: 'shopifySync',
      readOnly: true,
      fields: [
        defineField({
          name: 'uk',
          title: 'Ukrainian',
          type: 'string',
        }),
        defineField({
          name: 'ru',
          title: 'Russian',
          type: 'string',
        }),
      ],
    }),
    // Localized descriptions
    defineField({
      name: 'descriptions',
      title: 'Localized Descriptions',
      type: 'object',
      group: 'shopifySync',
      readOnly: true,
      fields: [
        defineField({
          name: 'uk',
          title: 'Ukrainian',
          type: 'text',
          rows: 5,
        }),
        defineField({
          name: 'ru',
          title: 'Russian',
          type: 'text',
          rows: 5,
        }),
      ],
    }),
    // SEO with translations
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'shopifySync',
      readOnly: true,
      fields: [
        defineField({
          name: 'title',
          title: 'Meta Title',
          type: 'object',
          fields: [
            defineField({
              name: 'default',
              title: 'Default',
              type: 'string',
            }),
            defineField({
              name: 'uk',
              title: 'Ukrainian',
              type: 'string',
            }),
            defineField({
              name: 'ru',
              title: 'Russian',
              type: 'string',
            }),
          ],
        }),
        defineField({
          name: 'description',
          title: 'Meta Description',
          type: 'object',
          fields: [
            defineField({
              name: 'default',
              title: 'Default',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'uk',
              title: 'Ukrainian',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'ru',
              title: 'Russian',
              type: 'text',
              rows: 3,
            }),
          ],
        }),
      ],
    }),
  ],
  orderings: [
    {
      name: 'titleAsc',
      title: 'Title (A-Z)',
      by: [{ field: 'store.title', direction: 'asc' }],
    },
    {
      name: 'titleDesc',
      title: 'Title (Z-A)',
      by: [{ field: 'store.title', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      imageUrl: 'store.imageUrl',
      isDeleted: 'store.isDeleted',
      rules: 'store.rules',
      title: 'store.title',
    },
    prepare(selection) {
      const { imageUrl, isDeleted, rules, title } = selection;
      const ruleCount = rules?.length || 0;

      return {
        media: (
          <ShopifyDocumentStatus
            isDeleted={isDeleted}
            type="collection"
            url={imageUrl}
            title={title}
          />
        ),
        subtitle:
          ruleCount > 0
            ? `Automated (${pluralize('rule', ruleCount, true)})`
            : 'Manual',
        title,
      };
    },
  },
});
