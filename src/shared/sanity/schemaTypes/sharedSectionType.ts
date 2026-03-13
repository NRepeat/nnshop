import { defineType, defineField, defineArrayMember } from 'sanity';
import { ComponentIcon } from '@sanity/icons';

export const sharedSectionType = defineType({
  name: 'sharedSection',
  type: 'document',
  title: 'Shared Section',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'internalTitle',
      title: 'Internal Title',
      type: 'string',
      description: 'Used only in Studio to identify this section',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({ type: 'heroSlider' }),
        defineArrayMember({ type: 'mainCollectionGrid' }),
        defineArrayMember({ type: 'hero' }),
        defineArrayMember({ type: 'brandGridBlock' }),
        defineArrayMember({ type: 'splitImage' }),
        defineArrayMember({ type: 'features' }),
        defineArrayMember({ type: 'faqs' }),
        defineArrayMember({ type: 'productCarousel' }),
        defineArrayMember({ type: 'similarProducts' }),
        defineArrayMember({ type: 'contentPageBlock' }),
        defineArrayMember({ type: 'collectionsCarousel' }),
        defineArrayMember({ type: 'sliderBlock' }),
        defineArrayMember({ type: 'productDetails' }),
        defineArrayMember({ type: 'elegantEase' }),
        defineArrayMember({ type: 'productComments' }),
        defineArrayMember({ type: 'collectionsWithPreviews' }),
        defineArrayMember({ type: 'popularPosts' }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'internalTitle',
    },
    prepare({ title }) {
      return {
        title: title ?? 'Untitled section',
        subtitle: 'Shared Section',
      };
    },
  },
});
