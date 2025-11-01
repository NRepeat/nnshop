import { defineType, defineArrayMember } from 'sanity';

export const pageBuilderType = defineType({
  name: 'pageBuilder',
  type: 'array',
  of: [
    defineArrayMember({ type: 'hero' }),
    defineArrayMember({ type: 'splitImage' }),
    defineArrayMember({ type: 'features' }),
    defineArrayMember({ type: 'faqs' }),
    defineArrayMember({ type: 'productCarousel' }),
    defineArrayMember({ type: 'collectionsCarousel' }),
    defineArrayMember({ type: 'sliderBlock' }),
  ],
  options: {
    insertMenu: {
      views: [
        {
          name: 'grid',
          previewImageUrl: (schemaType) => {
            const svgPreviews = [
              'sliderBlock',
              'productCarousel',
              'collectionsCarousel',
            ];
            const extension = svgPreviews.includes(schemaType) ? 'svg' : 'png';
            return `/block-previews/${schemaType}.${extension}`;
          },
        },
      ],
    },
  },
});
