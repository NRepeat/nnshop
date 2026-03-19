// Default gender for users without a gender cookie
export const DEFAULT_GENDER = 'woman' as const;

// All supported genders (used for routing and segmentation)
export const GENDERS = ['woman', 'man'] as const;
export type Gender = (typeof GENDERS)[number];

// Default locale
export const DEFAULT_LOCALE = 'uk';

// Shopify metafield key for the custom discount percentage
export const DISCOUNT_METAFIELD_KEY = 'znizka';

// Default currency code
export const DEFAULT_CURRENCY_CODE = 'UAH';

// Default country code
export const DEFAULT_COUNTRY_CODE = 'UA';

// External price subscription service URL
export const PRICE_APP_URL = process.env.PRICE_APP_URL ?? 'https://prod.nnninc.uk';
