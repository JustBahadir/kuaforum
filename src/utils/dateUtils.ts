
/**
 * Format a date to a Turkish-style date string
 * @param date The date to format
 * @returns Formatted date string (e.g., "31.12.2023")
 */
export function formatTurkishDate(date: Date | null | undefined): string {
  if (!date) return '';
  return date.toLocaleDateString('tr-TR');
}

/**
 * Get the first day of the month for a given date
 * @param date The reference date
 * @returns Date object representing the first day of the month
 */
export function getFirstDayOfMonth(date: Date): Date {
  const firstDay = new Date(date);
  firstDay.setDate(1);
  return firstDay;
}

/**
 * Get the last day of the month for a given date
 * @param date The reference date
 * @returns Date object representing the last day of the month
 */
export function getLastDayOfMonth(date: Date): Date {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return lastDay;
}

/**
 * Generate a date range between two dates
 * @param startDate Start date
 * @param endDate End date
 * @returns Array of dates between start and end dates (inclusive)
 */
export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * Check if two dates are the same day
 * @param date1 First date to compare
 * @param date2 Second date to compare
 * @returns True if both dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get a date for the same day in the next month
 * @param date The reference date
 * @returns Date object representing the same day in the next month
 */
export function getNextMonthSameDay(date: Date): Date {
  const nextMonth = new Date(date);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return nextMonth;
}

/**
 * Get a date for the same day in the previous month
 * @param date The reference date
 * @returns Date object representing the same day in the previous month
 */
export function getPreviousMonthSameDay(date: Date): Date {
  const prevMonth = new Date(date);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  return prevMonth;
}
