import { defineType, defineArrayMember } from 'sanity';

/**
 * Reusable content blocks array type.
 * Use this in any document that needs page builder functionality.
 *
 * Usage in schema:
 * defineField({
 *   name: 'content',
 *   title: 'Content',
 *   type: 'contentBlocks',
 * })
 */
export const contentBlocksType = defineType({
  name: 'contentBlocks',
  title: 'Content Blocks',
  type: 'array',
  of: [
    // Hero blocks
    defineArrayMember({ type: 'heroSlider', title: 'Hero Slider' }),
    defineArrayMember({ type: 'hero', title: 'Hero Banner' }),
    defineArrayMember({ type: 'sliderBlock', title: 'Image Slider' }),

    // Collection blocks
    defineArrayMember({ type: 'mainCollectionGrid', title: 'Collection Grid' }),
    defineArrayMember({ type: 'collectionsCarousel', title: 'Collections Carousel' }),
    defineArrayMember({ type: 'collectionsWithPreviews', title: 'Collections with Previews' }),

    // Product blocks
    defineArrayMember({ type: 'productCarousel', title: 'Product Carousel' }),
    defineArrayMember({ type: 'similarProducts', title: 'Similar Products' }),
    defineArrayMember({ type: 'productDetails', title: 'Product Details' }),
    defineArrayMember({ type: 'productComments', title: 'Product Comments' }),

    // Brand blocks
    defineArrayMember({ type: 'brandGridBlock', title: 'Brand Grid' }),

    // Content blocks
    defineArrayMember({ type: 'splitImage', title: 'Split Image' }),
    defineArrayMember({ type: 'features', title: 'Features' }),
    defineArrayMember({ type: 'contentPageBlock', title: 'Content Block' }),
    defineArrayMember({ type: 'elegantEase', title: 'Elegant Ease' }),

    // FAQ blocks
    defineArrayMember({ type: 'faqs', title: 'FAQs' }),
  ],
  options: {
    insertMenu: {
      filter: true,
      showIcons: true,
      groups: [
        { name: 'hero', title: 'Hero & Sliders', of: ['heroSlider', 'hero', 'sliderBlock'] },
        { name: 'collections', title: 'Collections', of: ['mainCollectionGrid', 'collectionsCarousel', 'collectionsWithPreviews'] },
        { name: 'products', title: 'Products', of: ['productCarousel', 'similarProducts', 'productDetails', 'productComments'] },
        { name: 'brands', title: 'Brands', of: ['brandGridBlock'] },
        { name: 'content', title: 'Content', of: ['splitImage', 'features', 'contentPageBlock', 'elegantEase'] },
        { name: 'faq', title: 'FAQ', of: ['faqs'] },
      ],
      views: [
        {
          name: 'grid',
          previewImageUrl: (schemaType) => `/block-previews/${schemaType}.png`,
        },
      ],
    },
  },
});
