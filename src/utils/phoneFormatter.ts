
/**
 * Formats a phone number as 05XX XXX XX XX
 */
export const formatPhoneNumber = (value: string): string => {
  // Sadece rakamları al
  const numbers = value.replace(/\D/g, '');
  
  // Formatlama: 05XX XXX XX XX
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6)}`;
  } else {
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8, 10)}`;
  }
};
