import { describe, it, expect } from 'vitest';
import { getProductAlt } from './getImageAlt';

describe('getProductAlt', () => {
  it('should return the product title when no variant is provided', () => {
    const product = { title: 'Чорні шкіряні черевики' };
    expect(getProductAlt(product)).toBe('Чорні шкіряні черевики');
  });

  it('should return the product title and variant title when both are provided', () => {
    const product = { title: 'Чорні шкіряні черевики' };
    const variant = { title: 'жіночі' };
    expect(getProductAlt(product, variant)).toBe('Чорні шкіряні черевики жіночі');
  });

  it('should ignore "Default Title" for variant', () => {
    const product = { title: 'Чорні шкіряні черевики' };
    const variant = { title: 'Default Title' };
    expect(getProductAlt(product, variant)).toBe('Чорні шкіряні черевики');
  });

  it('should ignore case for "default title"', () => {
    const product = { title: 'Чорні шкіряні черевики' };
    const variant = { title: 'default title' };
    expect(getProductAlt(product, variant)).toBe('Чорні шкіряні черевики');
  });

  it('should decode HTML entities', () => {
    const product = { title: 'Brand &amp; Co' };
    expect(getProductAlt(product)).toBe('Brand & Co');
  });

  it('should handle empty product title gracefully', () => {
    const product = { title: '' };
    expect(getProductAlt(product)).toBe('');
  });

  it('should trim whitespace', () => {
    const product = { title: '  Product Title  ' };
    const variant = { title: '  Variant  ' };
    expect(getProductAlt(product, variant)).toBe('Product Title Variant');
  });
});
