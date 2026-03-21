import { describe, it, expect } from 'vitest';
import { 
  generateOrganizationJsonLd, 
  generateWebSiteJsonLd, 
  generateItemListJsonLd, 
  generateWebPageJsonLd, 
  generateProductJsonLd 
} from '../seo/jsonld';

describe('JSON-LD Schema Generation (Phase 15)', () => {
  it('generateOrganizationJsonLd should return valid Organization structure', () => {
    const jsonLd: any = generateOrganizationJsonLd();
    expect(jsonLd['@type']).toBe('Organization');
    expect(jsonLd.contactPoint['@type']).toBe('ContactPoint');
    expect(jsonLd.contactPoint.telephone).toBe('+380972179292');
    expect(jsonLd.contactPoint.email).toBe('info@miomio.com.ua');
    expect(jsonLd.sameAs).toContain('https://instagram.com/miomiocomua');
  });

  it('generateWebSiteJsonLd should return valid SearchAction structure', () => {
    const jsonLd: any = generateWebSiteJsonLd('uk');
    expect(jsonLd['@type']).toBe('WebSite');
    expect(jsonLd.potentialAction['@type']).toBe('SearchAction');
    expect(jsonLd.potentialAction.target.urlTemplate).toContain('/uk/search?q={search_term_string}');
  });

  it('generateItemListJsonLd should return valid ItemList structure', () => {
    const mockProducts = [
      { handle: 'product-1' },
      { handle: 'product-2' }
    ];
    const jsonLd: any = generateItemListJsonLd(mockProducts, 'uk');
    expect(jsonLd['@type']).toBe('ItemList');
    expect(jsonLd.itemListElement).toHaveLength(2);
    expect(jsonLd.itemListElement[0].position).toBe(1);
    expect(jsonLd.itemListElement[0].url).toContain('/uk/product/product-1');
  });

  it('generateWebPageJsonLd should return valid WebPage structure', () => {
    const jsonLd: any = generateWebPageJsonLd('Title', 'Description', 'https://example.com');
    expect(jsonLd['@type']).toBe('WebPage');
    expect(jsonLd.name).toBe('Title');
    expect(jsonLd.description).toBe('Description');
    expect(jsonLd.url).toBe('https://example.com');
  });

  it('generateProductJsonLd should include refined return and shipping policies', () => {
    const mockProduct: any = {
      title: 'Test Product',
      handle: 'test-product',
      priceRange: {
        minVariantPrice: { amount: '100', currencyCode: 'UAH' }
      },
      images: { edges: [] },
      variants: { edges: [{ node: { availableForSale: true, price: { amount: '100', currencyCode: 'UAH' } } }] }
    };

    const jsonLd: any = generateProductJsonLd(mockProduct, 'uk');
    const offer = jsonLd.offers;
    
    expect(offer.hasMerchantReturnPolicy.merchantReturnDays).toBe(14);
    expect(offer.hasMerchantReturnPolicy.returnFees).toBe('https://schema.org/FreeReturn');
    expect(offer.shippingDetails.shippingRate.value).toBe('0');
    expect(offer.shippingDetails.deliveryTime.transitTime.maxValue).toBe(3);
  });
});
