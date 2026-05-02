import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateGoogleMerchantXml } from './google-merchant';
import { storefrontClient } from '@shared/lib/shopify/client';

// Mock environment variables
process.env.NEXT_PUBLIC_SITE_URL = 'https://www.miomio.com.ua';

// Mock storefrontClient
vi.mock('@shared/lib/shopify/client', () => ({
  storefrontClient: {
    request: vi.fn(),
  },
}));

describe('Google Merchant Feed Generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate valid RSS XML structure with products and taxonomy mapping', async () => {
    const mockResponse = {
      products: {
        edges: [
          {
            node: {
              id: 'gid://shopify/Product/123',
              title: 'Test Product',
              handle: 'test-product',
              description: 'Test Description',
              vendor: 'Test Brand',
              productType: 'Shoes',
              updatedAt: '2024-01-01T00:00:00Z',
              category: {
                id: 'gid://shopify/TaxonomyCategory/aa-1-1-9',
                name: 'Leotards & Unitards'
              },
              featuredImage: { url: 'https://test.com/image.jpg' },
              priceRange: {
                maxVariantPrice: { amount: '100.00', currencyCode: 'UAH' },
              },
              metafield: { value: '10', key: 'znizka' }, // 10% discount
              productCategory: {
                productTaxonomyNode: {
                  fullName: 'Apparel & Accessories > Clothing > Activewear',
                  name: 'Activewear'
                }
              },
              variants: {
                edges: [
                  {
                    node: {
                      id: 'gid://shopify/ProductVariant/456',
                      sku: 'SKU123',
                      title: '42 / White',
                      availableForSale: true,
                      quantityAvailable: 5,
                      price: { amount: '100.00', currencyCode: 'UAH' },
                      selectedOptions: [
                        { name: 'Size', value: '42' },
                        { name: 'Color', value: 'White' },
                      ],
                      image: { url: 'https://test.com/variant.jpg' },
                    },
                  },
                ],
              },
            },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    };

    vi.mocked(storefrontClient.request).mockResolvedValue(mockResponse);

    const xml = await generateGoogleMerchantXml('uk');

    // Basic structure checks
    expect(xml).toContain('<?xml version="1.0"?>');
    expect(xml).toContain('<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">');
    expect(xml).toContain('<title>MioMio - Італійське взуття та одяг</title>');

    // Product item checks
    expect(xml).toContain('<g:id>SKU123</g:id>');
    expect(xml).toContain('<g:title>Test Brand Test Product</g:title>');
    expect(xml).toContain('<g:link>https://www.miomio.com.ua/uk/product/test-product</g:link>');
    expect(xml).toContain('<g:price>90.00 UAH</g:price>'); // 100 - 10%
    expect(xml).toContain('<g:availability>in_stock</g:availability>');
    expect(xml).toContain('<g:brand>Test Brand</g:brand>');
    
    // Check taxonomy mapping: gid://shopify/TaxonomyCategory/aa-1-1-9 maps to Google ID "5490"
    expect(xml).toContain('<g:google_product_category>5490</g:google_product_category>');
    
    expect(xml).toContain('<g:product_type>Shoes</g:product_type>');
    expect(xml).toContain('<g:color>White</g:color>');
    expect(xml).toContain('<g:size>42</g:size>');
    expect(xml).toContain('<g:identifier_exists>no</g:identifier_exists>');
  });

  it('should fallback to productCategory if category mapping is missing', async () => {
    const mockResponse = {
      products: {
        edges: [
          {
            node: {
              id: 'gid://shopify/Product/123',
              title: 'Test Product',
              handle: 'test-product',
              vendor: 'Test Brand',
              category: {
                id: 'gid://shopify/TaxonomyCategory/unknown',
                name: 'Unknown'
              },
              productCategory: {
                productTaxonomyNode: {
                  fullName: 'Shopify Category',
                  name: 'Shopify Name'
                }
              },
              variants: {
                edges: [
                  {
                    node: {
                      id: 'gid://shopify/ProductVariant/456',
                      sku: 'SKU123',
                      availableForSale: true,
                      price: { amount: '100.00', currencyCode: 'UAH' },
                      selectedOptions: [],
                    },
                  },
                ],
              },
            },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    };

    vi.mocked(storefrontClient.request).mockResolvedValue(mockResponse);

    const xml = await generateGoogleMerchantXml('uk');

    expect(xml).toContain('<g:google_product_category>Shopify Category</g:google_product_category>');
  });

  it('should generate valid RSS XML structure for RU locale', async () => {
    const mockResponse = {
      products: {
        edges: [
          {
            node: {
              id: 'gid://shopify/Product/123',
              title: 'Тестовый Продукт',
              handle: 'test-product',
              description: 'Тестовое Описание',
              vendor: 'Test Brand',
              variants: {
                edges: [
                  {
                    node: {
                      id: 'gid://shopify/ProductVariant/456',
                      sku: 'SKU123',
                      title: '42 / Белый',
                      availableForSale: true,
                      quantityAvailable: 10,
                      price: { amount: '100.00', currencyCode: 'UAH' },
                      selectedOptions: [
                        { name: 'Размер', value: '42' },
                        { name: 'Цвет', value: 'Белый' },
                      ],
                    },
                  },
                ],
              },
            },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    };

    vi.mocked(storefrontClient.request).mockResolvedValue(mockResponse);

    const xml = await generateGoogleMerchantXml('ru');

    expect(xml).toContain('<title>MioMio - Итальянская обувь и одежда</title>');
    expect(xml).toContain('<g:title>Test Brand Тестовый Продукт</g:title>');
    expect(xml).toContain('<g:link>https://www.miomio.com.ua/ru/product/test-product</g:link>');
    expect(xml).toContain('<g:color>Белый</g:color>');
  });

  it('should escape XML special characters in titles and brands', async () => {
    const mockResponse = {
      products: {
        edges: [
          {
            node: {
              id: 'gid://shopify/Product/789',
              title: 'Product & Co',
              handle: 'product-co',
              vendor: 'Mary & Co',
              variants: {
                edges: [
                  {
                    node: {
                      id: 'gid://shopify/ProductVariant/012',
                      title: 'Default',
                      availableForSale: true,
                      price: { amount: '50.00', currencyCode: 'UAH' },
                      selectedOptions: [],
                    },
                  },
                ],
              },
            },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    };

    vi.mocked(storefrontClient.request).mockResolvedValue(mockResponse);

    const xml = await generateGoogleMerchantXml();

    expect(xml).toContain('<g:brand>Mary &amp; Co</g:brand>');
    expect(xml).toContain('<g:title>Mary &amp; Co Product &amp; Co</g:title>');
  });
});
