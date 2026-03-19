import { describe, it, expect } from 'vitest';
import { filterProducts, FilterProduct } from './filterProducts';

// --- helpers ---

function makeVariant(
  size: string | null,
  qty: number | null,
  available = true,
  extra: { name: string; value: string }[] = [],
) {
  return {
    node: {
      availableForSale: available,
      quantityAvailable: qty,
      selectedOptions: [
        ...(size !== null ? [{ name: 'Розмір', value: size }] : []),
        ...extra,
      ],
    },
  };
}

function makeProduct(
  variants: ReturnType<typeof makeVariant>[],
  price = '1000',
  totalInventory: number | null = 10,
): FilterProduct {
  return {
    priceRange: {
      minVariantPrice: { amount: price },
      maxVariantPrice: { amount: price },
    },
    totalInventory,
    variants: { edges: variants },
  };
}

const noFilters = new Set<string>();
const noGroups = new Map();

// --- tests ---

describe('filterProducts — розмірний фільтр', () => {
  it('показує продукт де розмір 46 є в наявності', () => {
    const products = [makeProduct([makeVariant('46', 5)])];
    const result = filterProducts(products, new Set(['46']), noGroups);
    expect(result).toHaveLength(1);
  });

  it('ховає продукт де розмір 46 = 0 штук', () => {
    const products = [makeProduct([makeVariant('46', 0)])];
    const result = filterProducts(products, new Set(['46']), noGroups);
    expect(result).toHaveLength(0);
  });

  it('ховає продукт де розмір 46 недоступний (availableForSale=false)', () => {
    const products = [makeProduct([makeVariant('46', null, false)])];
    const result = filterProducts(products, new Set(['46']), noGroups);
    expect(result).toHaveLength(0);
  });

  it('ховає продукт де немає варіанту з розміром 46', () => {
    const products = [makeProduct([makeVariant('40', 5), makeVariant('38', 3)])];
    const result = filterProducts(products, new Set(['46']), noGroups);
    expect(result).toHaveLength(0);
  });

  it('показує продукт де один розмір 0 але інший вибраний є в наявності', () => {
    // 46 — немає, 40 — є; фільтр по 40
    const products = [makeProduct([makeVariant('46', 0), makeVariant('40', 3)])];
    const result = filterProducts(products, new Set(['40']), noGroups);
    expect(result).toHaveLength(1);
  });

  it('OR в рамках одного фільтра: показує якщо хоч один розмір є', () => {
    // Вибрано 46 і 48, продукт має 46=0, 48=2
    const products = [makeProduct([makeVariant('46', 0), makeVariant('48', 2)])];
    const result = filterProducts(products, new Set(['46', '48']), noGroups);
    expect(result).toHaveLength(1);
  });

  it('quantityAvailable=null (безліміт/без трекінгу) — показує продукт', () => {
    const products = [makeProduct([makeVariant('46', null, true)])];
    const result = filterProducts(products, new Set(['46']), noGroups);
    expect(result).toHaveLength(1);
  });

  it('працює з назвою опції "размер" (Russian)', () => {
    const product: FilterProduct = {
      priceRange: { minVariantPrice: { amount: '500' } },
      totalInventory: 5,
      variants: {
        edges: [
          {
            node: {
              availableForSale: true,
              quantityAvailable: 3,
              selectedOptions: [{ name: 'Размер', value: '42' }],
            },
          },
        ],
      },
    };
    const result = filterProducts([product], new Set(['42']), noGroups);
    expect(result).toHaveLength(1);
  });

  it('працює з англійською назвою опції "size"', () => {
    const product: FilterProduct = {
      priceRange: { minVariantPrice: { amount: '500' } },
      totalInventory: 5,
      variants: {
        edges: [
          {
            node: {
              availableForSale: true,
              quantityAvailable: 2,
              selectedOptions: [{ name: 'size', value: 'M' }],
            },
          },
        ],
      },
    };
    // "M" → toFilterSlug("M") = "m"
    const result = filterProducts([product], new Set(['m']), noGroups);
    expect(result).toHaveLength(1);
  });
});

describe('filterProducts — без фільтрів', () => {
  it('показує продукт з totalInventory > 0', () => {
    const products = [makeProduct([makeVariant('46', 5)], '999', 5)];
    const result = filterProducts(products, noFilters, noGroups);
    expect(result).toHaveLength(1);
  });

  it('ховає продукт з totalInventory = 0', () => {
    const products = [makeProduct([makeVariant('46', 0)], '999', 0)];
    const result = filterProducts(products, noFilters, noGroups);
    expect(result).toHaveLength(0);
  });

  it('показує продукт з totalInventory = null (без трекінгу)', () => {
    const products = [makeProduct([makeVariant('46', null)], '999', null)];
    const result = filterProducts(products, noFilters, noGroups);
    expect(result).toHaveLength(1);
  });
});

describe('filterProducts — фільтр по ціні', () => {
  it('ховає продукт без ціни', () => {
    const product: FilterProduct = {
      priceRange: { minVariantPrice: { amount: '0' }, maxVariantPrice: { amount: '0' } },
      totalInventory: 10,
      variants: { edges: [makeVariant('46', 5)] },
    };
    const result = filterProducts([product], noFilters, noGroups);
    expect(result).toHaveLength(0);
  });
});

describe('filterProducts — optionGroups (колір і т.д.)', () => {
  it('показує продукт де варіант відповідає кольору І розміру', () => {
    const products = [
      makeProduct([
        makeVariant('46', 5, true, [{ name: 'Колір', value: 'Чорний' }]),
      ]),
    ];
    const groups = new Map([
      ['kolir', { name: 'Колір', values: new Set(['Чорний']) }],
    ]);
    const result = filterProducts(products, new Set(['46']), groups);
    expect(result).toHaveLength(1);
  });

  it('ховає продукт якщо колір не збігається', () => {
    const products = [
      makeProduct([
        makeVariant('46', 5, true, [{ name: 'Колір', value: 'Білий' }]),
      ]),
    ];
    const groups = new Map([
      ['kolir', { name: 'Колір', values: new Set(['Чорний']) }],
    ]);
    const result = filterProducts(products, new Set(['46']), groups);
    expect(result).toHaveLength(0);
  });
});
