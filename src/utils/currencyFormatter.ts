
/**
 * Formats a number as Turkish Lira currency
 * @param value The value to format
 * @returns The formatted currency string
 */
export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return "0,00 ₺";
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return "0,00 ₺";
  
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};
