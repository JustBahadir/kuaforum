
import { CalismaSaati } from '@/lib/supabase/types';
import { gunSiralama } from '../constants/workingDays';

/**
 * Sort working hours by the predefined day order
 */
export const sortWorkingHours = (calismaSaatleri: CalismaSaati[]): CalismaSaati[] => {
  return [...calismaSaatleri].sort((a, b) => {
    const aIndex = gunSiralama.indexOf(a.gun);
    const bIndex = gunSiralama.indexOf(b.gun);
    return aIndex - bIndex;
  });
};

/**
 * Creates default working hours for a shop
 */
export const createDefaultWorkingHours = (dukkanId: number = 0): CalismaSaati[] => {
  return gunSiralama.map((gun, index) => ({
    id: -(index + 1), // Negative IDs for unsaved records
    gun,
    acilis: "09:00",
    kapanis: "18:00",
    kapali: gun === "pazar", // Close Sundays by default
    dukkan_id: dukkanId
  }));
};

/**
 * Prepare working hour data for updates
 */
export const prepareHourUpdates = (
  id: number, 
  updates: Partial<CalismaSaati>, 
  currentDay?: CalismaSaati,
  dukkanId?: number
): Partial<CalismaSaati> => {
  // Make sure gun is included for validation
  const preparedUpdates = {
    ...updates,
    gun: updates.gun || (currentDay?.gun || ""),
    dukkan_id: dukkanId || currentDay?.dukkan_id || 0,
  };
  
  // If shop is marked as closed, ensure times are cleared
  if (updates.kapali) {
    preparedUpdates.acilis = null;
    preparedUpdates.kapanis = null;
  }
  
  return preparedUpdates;
};
