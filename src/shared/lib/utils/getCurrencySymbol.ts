import getSymbolFromCurrency from 'currency-symbol-map';

/**
 * Returns the display label for a given ISO currency code.
 * UAH is overridden to return 'грн' instead of the default '₴' symbol.
 */
export function getCurrencySymbol(currencyCode: string): string {
  if (currencyCode === 'UAH') return 'грн';
  return getSymbolFromCurrency(currencyCode) || currencyCode;
}
