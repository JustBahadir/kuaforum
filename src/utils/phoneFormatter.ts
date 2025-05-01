
/**
 * Formats a phone number as 05XX XXX XX XX
 * For Turkish mobile numbers
 */
export const formatPhoneNumber = (value: string): string => {
  // Sadece rakamları al
  const numbers = value.replace(/\D/g, '');
  
  // Format: 05XX XXX XX XX
  if (numbers.length <= 4) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7)}`;
  } else {
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7, 9)} ${numbers.slice(9, 11)}`;
  }
};

/**
 * Validates a phone number to ensure it's in the correct format
 * Only allows numeric input
 */
export const validatePhoneNumber = (value: string): boolean => {
  // Check if the value contains only digits after removing spaces
  return /^\d+$/.test(value.replace(/\s/g, ''));
};
