
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

/**
 * Create a date range for a month cycle
 * @param cycleDay The day of the month that starts the cycle (e.g., 15)
 * @param referenceDate The reference date to calculate from (defaults to today)
 * @returns Object with from and to dates
 */
export const createMonthCycleDateRange = (
  cycleDay: number = 1,
  referenceDate: Date = new Date()
): { from: Date; to: Date } => {
  const today = new Date(referenceDate);
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let fromDate: Date;
  let toDate: Date;

  // If we're on or after the cycle day, period starts on cycle day of current month
  // and ends the day before cycle day of next month
  if (currentDay >= cycleDay) {
    fromDate = new Date(currentYear, currentMonth, cycleDay);
    toDate = new Date(currentYear, currentMonth + 1, cycleDay - 1);
  } 
  // If we're before the cycle day, period starts on cycle day of previous month
  // and ends the day before cycle day of current month
  else {
    fromDate = new Date(currentYear, currentMonth - 1, cycleDay);
    toDate = new Date(currentYear, currentMonth, cycleDay - 1);
  }
  
  // Ensure start of day for fromDate and end of day for toDate
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);
  
  return { from: fromDate, to: toDate };
};
