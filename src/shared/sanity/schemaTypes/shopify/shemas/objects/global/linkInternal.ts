import { PAGE_REFERENCES } from '@/shared/sanity/constants';
import { getPriceRange } from '@/shared/sanity/utils/shopify/getPriceRange';
import { LinkIcon } from '@sanity/icons';
import { defineField } from 'sanity';

export default defineField({
  title: 'Internal Link',
  name: 'linkInternal',
  type: 'object',
  icon: LinkIcon,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'localizedString',
    },
    {
      name: 'reference',
      type: 'reference',
      weak: true,
      validation: (Rule) => Rule.required(),
      to: PAGE_REFERENCES,
    },
  ],
  preview: {
    select: {
      reference: 'reference',
      referenceProductTitle: 'reference.store.title',
      referenceProductPriceRange: 'reference.store.priceRange',
      referenceTitle: 'reference.title',
      referenceType: 'reference._type',
      title: 'title',
    },
    prepare(selection) {
      console.log(selection);
      const {
        reference,
        referenceProductPriceRange,
        referenceProductTitle,
        referenceTitle,
        referenceType,
        title,
      } = selection;

      const subtitle = [];
      if (reference) {
        subtitle.push([
          `→ ${referenceTitle || referenceProductTitle || reference?._id}`,
        ]);
        if (referenceType === 'product' && referenceProductPriceRange) {
          subtitle.push(`(${getPriceRange(referenceProductPriceRange)})`);
        }
      } else {
        subtitle.push('(Nonexistent document reference)');
      }

      return {
        // media: image,
        subtitle: subtitle.join(' '),
        title:title.uk,
      };
    },
  },
});
