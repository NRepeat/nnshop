import ShopifyDocumentStatus from '@/sanity/components/shopify/media/ShopifyDocumentStatus';
import { SANITY_API_VERSION } from '@/sanity/constants';
import { getPriceRange } from '@/sanity/utils/shopify/getPriceRange';
import { TagIcon } from '@sanity/icons';
import pluralize from 'pluralize-esm';
import React from 'react';
import { defineField } from 'sanity';

export default defineField({
  name: 'productWithVariant',
  title: 'Product with variant',
  type: 'object',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'product',
      type: 'reference',
      to: [{ type: 'product' }],
      weak: true,
    }),
    defineField({
      name: 'variant',
      type: 'reference',
      to: [{ type: 'productVariant' }],
      weak: true,
      description: 'First variant will be selected if left empty',
      options: {
        filter: ({ parent }) => {
          //@ts-expect-error @ts-ignore
          const productId = parent?.product?._ref;

          if (!productId) {
            return { filter: '', params: {} };
          }

          return {
            filter: `store.productGid == *[_id == $productId][0].store.gid && !store.isDeleted`,
            params: {
              productId: productId,
            },
          };
        },
      },
      hidden: ({ parent }) => {
        const productSelected = parent?.product;
        return !productSelected;
      },
      validation: (Rule) =>
        Rule.custom(async (value, { parent, getClient }) => {
          // Selected product in adjacent `product` field
          //@ts-expect-error  @ts-ignore
          const productId = parent?.product?._ref;
          // Selected product variant
          const productVariantId = value?._ref;

          console.log(productId, productVariantId);
          if (!productId || !productVariantId) {
            return true;
          }

          // If both product + product variant are specified,
          // check to see if `product` references this product variant.
          const result = await getClient({
            apiVersion: SANITY_API_VERSION,
          }).fetch(
            `*[_id == $productId && references($productVariantId)][0]._id`,
            {
              productId,
              productVariantId,
            },
          );

          return result ? true : 'Invalid product variant';
        }),
    }),
  ],
  preview: {
    select: {
      defaultVariantTitle: 'product.store.variants.0.store.title',
      isDeleted: 'product.store.isDeleted',
      optionCount: 'product.store.options.length',
      previewImageUrl: 'product.store.previewImageUrl',
      priceRange: 'product.store.priceRange',
      status: 'product.store.status',
      title: 'product.store.title',
      variantCount: 'product.store.variants.length',
      variantPreviewImageUrl: 'variant.store.previewImageUrl',
      variantTitle: 'variant.store.title',
    },
    prepare(selection) {
      const {
        defaultVariantTitle,
        isDeleted,
        optionCount,
        previewImageUrl,
        priceRange,
        status,
        title,
        variantCount,
        variantPreviewImageUrl,
        variantTitle,
      } = selection;

      const productVariantTitle = variantTitle || defaultVariantTitle;

      const previewTitle = [title];
      if (productVariantTitle) {
        previewTitle.push(`[${productVariantTitle}]`);
      }

      const description = [
        variantCount ? pluralize('variant', variantCount, true) : 'No variants',
        optionCount ? pluralize('option', optionCount, true) : 'No options',
      ];

      let subtitle = getPriceRange(priceRange);
      if (status !== 'active') {
        subtitle = '(Unavailable in Shopify)';
      }
      if (isDeleted) {
        subtitle = '(Deleted from Shopify)';
      }

      return {
        media: (
          <ShopifyDocumentStatus
            isActive={status === 'active'}
            isDeleted={isDeleted}
            type="product"
            url={variantPreviewImageUrl || previewImageUrl}
            title={previewTitle.join(' ')}
          />
        ),
        description: description.join(' / '),
        subtitle,
        title: previewTitle.join(' '),
      };
    },
  },
});
