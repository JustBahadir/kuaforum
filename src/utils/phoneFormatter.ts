
/**
 * Format a phone number string in Turkish format (05xx xxx xx xx)
 * @param digits The string of digits to format
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (digits: string): string => {
  // Remove any non-digit characters
  const cleanDigits = digits.replace(/\D/g, '');
  
  // If empty, return empty string
  if (!cleanDigits) {
    return '';
  }
  
  // Format according to Turkish mobile phone format
  let formattedNumber = '';
  
  if (cleanDigits.length <= 4) {
    // First 4 digits (area code)
    formattedNumber = cleanDigits;
  } else if (cleanDigits.length <= 7) {
    // First 4 digits + space + next 3
    formattedNumber = `${cleanDigits.slice(0, 4)} ${cleanDigits.slice(4)}`;
  } else if (cleanDigits.length <= 9) {
    // First 4 digits + space + next 3 + space + next 2
    formattedNumber = `${cleanDigits.slice(0, 4)} ${cleanDigits.slice(4, 7)} ${cleanDigits.slice(7)}`;
  } else {
    // Full format: 05xx xxx xx xx
    formattedNumber = `${cleanDigits.slice(0, 4)} ${cleanDigits.slice(4, 7)} ${cleanDigits.slice(7, 9)} ${cleanDigits.slice(9, 11)}`;
  }
  
  return formattedNumber;
};

/**
 * Validate that the input string contains only digits
 * @param input The string to validate
 * @returns True if the string contains only digits
 */
export const validatePhoneNumber = (input: string): boolean => {
  return /^\d*$/.test(input);
};

/**
 * Clean a phone number by removing all non-digit characters
 * @param phoneNumber The phone number string to clean
 * @returns Clean phone number with only digits
 */
export const cleanPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, '');
};
