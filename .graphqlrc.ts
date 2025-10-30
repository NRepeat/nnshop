import { ApiType, shopifyApiProject } from '@shopify/api-codegen-preset';

const config = {
  projects: {
    default: shopifyApiProject({
      apiType: ApiType.Storefront,
      apiVersion: '2025-10',
      documents: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
      outputDir: './src/shared/lib/shopify/types',
    }),
  },
};
export default config;
