
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(numAmount);
}

export function formatDate(date: string | Date): string {
  if (!date) return "-";
  return format(new Date(date), "dd MMMM yyyy", { locale: tr });
}

export function formatDateShort(date: string | Date): string {
  if (!date) return "-";
  return format(new Date(date), "dd.MM.yyyy", { locale: tr });
}
