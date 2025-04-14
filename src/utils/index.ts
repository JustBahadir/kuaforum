
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as Turkish Lira currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Debounces a function to only execute after a certain amount of time
 * @param func The function to debounce
 * @param wait The amount of time to wait in milliseconds
 * @returns A debounced function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null;

  const debouncedFunction = (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };

  return debouncedFunction;
}

/**
 * Helper function to safely access nested objects
 * @param obj The object to access
 * @param path Path to the property as string with dots (e.g. "person.address.city")
 * @param defaultValue Default value if path doesn't exist
 * @returns The value at path or defaultValue if path doesn't exist
 */
export function getNestedValue<T = any>(obj: any, path: string, defaultValue: T): T {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }

  return (current === undefined || current === null) ? defaultValue : current as T;
}
