export const DEFAULT_CURRENCY_CODE = 'UAH';

export const LOCKED_DOCUMENT_TYPES = ['settings', 'home', 'media.tag'];

export const SHOPIFY_DOCUMENT_TYPES = ['collection'];

export const PAGE_REFERENCES = [
  { type: 'collection' },
  { type: 'page' },
  // { type: 'product' },
];

// API version to use when using the Sanity client within the studio
// https://www.sanity.io/help/studio-client-specify-api-version
export const SANITY_API_VERSION = '2022-10-25';

// Your Shopify store ID.
// This is your unique store (e.g. 'my-store-name' in the complete URL of 'https://admin.shopify.com/store/my-store-name/').
// Set this to enable helper links in document status banners and shortcut links on products and collections.
export const SHOPIFY_STORE_ID = '';
