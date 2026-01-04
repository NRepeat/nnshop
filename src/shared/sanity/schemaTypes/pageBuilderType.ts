import { defineType, defineArrayMember } from 'sanity';

export const pageBuilderType = defineType({
  name: 'pageBuilder',
  type: 'array',
  of: [
    defineArrayMember({ type: 'heroSlider' }),
    defineArrayMember({ type: 'mainCollectionGrid' }),
    defineArrayMember({ type: 'hero' }),
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
  ],
  options: {
    insertMenu: {
      views: [
        {
          name: 'grid',
          previewImageUrl: (schemaType) => {
            const svgPreviews = [
              'heroSlider',
              // 'sliderBlock',
              // 'productCarousel',
              // 'collectionsCarousel',
            ];
            const extension = svgPreviews.includes(schemaType) ? 'svg' : 'png';
            return `/block-previews/${schemaType}.${extension}`;
          },
        },
      ],
    },
  },
});
