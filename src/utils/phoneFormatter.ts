
// Function to format phone numbers like: 05XX XXX XX XX
export function formatPhoneNumber(phoneNumber: string | number): string {
  if (!phoneNumber) return '';
  
  // Convert to string and remove all non-digit characters
  const cleaned = String(phoneNumber).replace(/\D/g, '');
  
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

// Validate Turkish phone number
export function validatePhoneNumber(phoneNumber: string | number): boolean {
  // Convert to string and remove all non-digit characters
  const cleaned = String(phoneNumber).replace(/\D/g, '');
  
  // Basic validation: Turkish mobile numbers start with 05 and are 10-11 digits
  if (cleaned.startsWith('05') && (cleaned.length === 10 || cleaned.length === 11)) {
    return true;
  }
  return false;
}

// Create a phone input mask transformer
export function formatPhoneInput(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  let formatted = '';
  
  if (cleaned.length <= 4) {
    formatted = cleaned;
  } else if (cleaned.length <= 7) {
    formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  } else if (cleaned.length <= 9) {
    formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else {
    formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
  }
  
  return formatted;
}

// Export the formatting function as default
export default formatPhoneNumber;
