import ProductTooltip from '@/sanity/components/shopify/hotstop/ProductTooltip';
import { defineField } from 'sanity';

export default defineField({
  name: 'productHotspots',
  title: 'Hotspots',
  type: 'array',
  of: [
    {
      type: 'spot',
    },
  ],
  options: {
    imageHotspot: {
      imagePath: 'image',
      tooltip: ProductTooltip,
      pathRoot: 'parent',
    },
  },
});
