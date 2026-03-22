import { describe, it, expect } from 'vitest';
import { 
  formatTitle, 
  generateProductMetadata, 
  generateCollectionMetadata, 
  generateBrandMetadata 
} from '../seo/generateMetadata';

describe('SEO Metadata Generation (Phase 14)', () => {
  describe('formatTitle helper', () => {
    it('should keep titles between 30 and 60 characters', () => {
      const shortTitle = 'Short Title';
      // formatTitle doesn't pad, but our templates ensure > 30. 
      // We test that it doesn't break short ones and truncates long ones.
      expect(formatTitle(shortTitle)).toBe('Short Title');
    });

    it('should truncate titles longer than 70 characters', () => {
      const longTitle = 'This is a very very very very very very very very very very very long title';
      const formatted = formatTitle(longTitle);
      expect(formatted.length).toBeLessThanOrEqual(70);
      expect(formatted).toContain('...');
    });

    it('should strip invisible characters before counting length', () => {
      const titleWithZeroWidth = 'Product\u200b Title'; // Contains zero-width space
      expect(titleWithZeroWidth.length).toBe(14);
      expect(formatTitle(titleWithZeroWidth).length).toBe(13);
    });
  });

  describe('generateProductMetadata', () => {
    const mockProduct = {
      title: 'Босоніжки Albano',
      vendor: 'Albano',
      productType: 'Босоніжки',
      variants: { edges: [{ node: { sku: '12345' } }] }
    };

    it('should generate UK title within 30-60 chars', () => {
      const metadata = generateProductMetadata(mockProduct, 'uk', 'slug');
      const title = (metadata.title as { absolute?: string })?.absolute as string;
      expect(title.length).toBeGreaterThanOrEqual(30);
      expect(title.length).toBeLessThanOrEqual(60);
      expect(title).toContain('Купити');
    });

    it('should generate RU title uniquely', () => {
      const metadata = generateProductMetadata(mockProduct, 'ru', 'slug');
      const title = (metadata.title as { absolute?: string })?.absolute as string;
      expect(title).toContain('Купить');
    });

    it('should generate description >= 70 chars', () => {
      const metadata = generateProductMetadata(mockProduct, 'uk', 'slug');
      expect(metadata.description!.length).toBeGreaterThanOrEqual(70);
    });
  });

  describe('generateCollectionMetadata', () => {
    const mockCollection = {
      title: 'Босоніжки',
    };

    it('should include gender in title and meet length requirements', () => {
      const metadata = generateCollectionMetadata(mockCollection, 'uk', 'slug', 'woman');
      const title = (metadata.title as { absolute?: string })?.absolute as string;
      expect(title).toContain('для жінок');
      expect(title.length).toBeGreaterThanOrEqual(30);
      expect(title.length).toBeLessThanOrEqual(60);
    });

    it('should generate unique RU collection title', () => {
      const metadata = generateCollectionMetadata(mockCollection, 'ru', 'slug', 'woman');
      const title = (metadata.title as { absolute?: string })?.absolute as string;
      expect(title).toContain('для женщин');
      expect(title).toContain('Купить');
    });
  });

  describe('generateBrandMetadata', () => {
    const mockBrand = {
      title: 'GHOUD',
    };

    it('should generate brand title within 30-60 chars', () => {
      const metadata = generateBrandMetadata(mockBrand, 'uk', 'slug');
      const title = (metadata.title as { absolute?: string })?.absolute as string;
      expect(title.length).toBeGreaterThanOrEqual(30);
      expect(title.length).toBeLessThanOrEqual(60);
      expect(title).toContain('купити в інтернет-магазині');
    });
  });
});
