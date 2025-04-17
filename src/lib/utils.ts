
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "dd MMMM yyyy", { locale: tr });
}

export function formatDateShort(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "dd.MM.yyyy", { locale: tr });
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "dd.MM.yyyy HH:mm", { locale: tr });
}

export function formatTime(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "HH:mm", { locale: tr });
}

// Calculate date range for a month cycle
export function calculateMonthCycleDateRange(day: number): { from: Date; to: Date } {
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  
  // Create the start date
  const fromDate = new Date(currentDate);
  fromDate.setDate(day);
  
  // If the current day is earlier than the cycle day, 
  // we need to go back to the previous month
  if (currentDay < day) {
    fromDate.setMonth(fromDate.getMonth() - 1);
  }
  
  // Create the end date (same day, next month)
  const toDate = new Date(fromDate);
  toDate.setMonth(toDate.getMonth() + 1);
  
  return { from: fromDate, to: toDate };
}
