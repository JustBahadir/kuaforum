
// Function to format phone numbers like: 05XX XXX XX XX
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format according to length
  if (cleaned.length <= 4) {
    return cleaned;
  } else if (cleaned.length <= 7) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  } else if (cleaned.length <= 9) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
  }
}

// Export the formatting function
export { formatPhoneNumber as default };
