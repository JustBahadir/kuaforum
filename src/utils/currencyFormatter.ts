
/**
 * Formats a number as currency in Turkish Lira (₺) format
 * @param value - Number to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    ...options,
  }).format(value);
}

export default formatCurrency;
