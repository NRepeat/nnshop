// src/shared/lib/sort-sizes.ts

const clothingSizeOrder = ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'];

function parseSize(size: string) {
  const sizeLower = size.toLowerCase();

  // Check if it's a clothing size
  const clothingIndex = clothingSizeOrder.indexOf(sizeLower);
  if (clothingIndex !== -1) {
    return { type: 'clothing', value: clothingIndex };
  }

  // Check if it's a numeric size (like shoe sizes, e.g., "42", "40-42", "41 1/3")
  // Extracts the first number found.
  const numericMatch = size.match(/(\d+(\.\d{1,2})?)/);
  if (numericMatch) {
    return { type: 'numeric', value: parseFloat(numericMatch[1]) };
  }

  // Fallback for non-standard sizes like "one size"
  return { type: 'other', value: sizeLower };
}

export function compareSizes(a: string, b: string) {
  const parsedA = parseSize(a);
  const parsedB = parseSize(b);

  // Group by type: clothing, then numeric, then other
  const typeOrder = { clothing: 0, numeric: 1, other: 2 };

  if (parsedA.type !== parsedB.type) {
    return typeOrder[parsedA.type] - typeOrder[parsedB.type];
  }

  // If same type, sort by value
  if (parsedA.type === 'clothing' || parsedA.type === 'numeric') {
    if (parsedA.value === parsedB.value) return 0;
    return (parsedA.value as number) > (parsedB.value as number) ? 1 : -1;
  }

  // For 'other' type, sort alphabetically
  return (parsedA.value as string).localeCompare(parsedB.value as string);
}
