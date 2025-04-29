
/**
 * Format a date string or Date object into a localized string
 * @param date The date to format
 * @param locale The locale to use (defaults to 'tr-TR')
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date | null | undefined, locale: string = 'tr-TR'): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format a date and time
 * @param date The date to format
 * @param locale The locale to use (defaults to 'tr-TR')
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string | Date | null | undefined, locale: string = 'tr-TR'): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(locale);
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return '';
  }
};

/**
 * Format a time
 * @param timeString Time string in format HH:MM or HH:MM:SS
 * @returns Formatted time string
 */
export const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return '';
  
  try {
    // Split the time string and take the first two parts (hours and minutes)
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};
