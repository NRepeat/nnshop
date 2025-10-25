import ProxyString from '@/shared/sanity/components/shopify/inputs/ProxyString';
import { defineField } from 'sanity';

export default defineField({
  name: 'proxyString',
  title: 'Title',
  type: 'string',
  components: {
    input: ProxyString,
  },
});
