import { defineType, defineField } from 'sanity';
import { ComponentIcon } from '@sanity/icons';

/**
 * Block Catalog document type.
 * A singleton document to preview and test all available content blocks.
 * This helps editors see all available blocks and their configurations.
 */
export const blockCatalogType = defineType({
  name: 'blockCatalog',
  title: 'Block Catalog',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Content Blocks Catalog',
      readOnly: true,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      initialValue:
        'This is a catalog of all available content blocks. Use this to preview and test blocks before adding them to pages.',
      readOnly: true,
    }),
    defineField({
      name: 'blocks',
      title: 'Available Blocks',
      description: 'All content blocks available for use in pages',
      type: 'contentBlocks',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      blocksCount: 'blocks',
    },
    prepare({ title, blocksCount }) {
      return {
        title: title || 'Block Catalog',
        subtitle: `${blocksCount?.length || 0} blocks configured`,
      };
    },
  },
});
