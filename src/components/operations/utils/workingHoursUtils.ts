
import { CalismaSaati } from "@/lib/supabase/types";
import { gunSiralama, gunIsimleri } from "../constants/workingDays";

/**
 * Sort working hours by the predefined day order
 */
export const sortWorkingHours = (calismaSaatleri: CalismaSaati[]): CalismaSaati[] => {
  return [...calismaSaatleri].sort((a, b) => {
    // Convert gun to number if it's a string (using the index from gunSiralama)
    const aIndex = typeof a.gun === 'string' ? gunSiralama.indexOf(parseInt(a.gun)) : gunSiralama.indexOf(a.gun);
    const bIndex = typeof b.gun === 'string' ? gunSiralama.indexOf(parseInt(b.gun)) : gunSiralama.indexOf(b.gun);
    return aIndex - bIndex;
  });
};

/**
 * Creates default working hours for a shop
 */
export const createDefaultWorkingHours = (dukkanId: number = 0): CalismaSaati[] => {
  return gunSiralama.map((gun, index) => ({
    id: -(index + 1), // Negative IDs for unsaved records
    gun: gun.toString(), // Convert number to string to match CalismaSaati type
    gun_sira: index + 1,
    acilis: "09:00",
    kapanis: "18:00",
    kapali: gun === 0, // Close Sundays (0) by default
    dukkan_id: dukkanId
  }));
};

/**
 * Generate default working hours for a shop
 */
export const generateDefaultWorkingHours = (dukkanId: number): CalismaSaati[] => {
  return [
    { id: 1, dukkan_id: dukkanId, gun: "1", gun_sira: 1, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 2, dukkan_id: dukkanId, gun: "2", gun_sira: 2, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 3, dukkan_id: dukkanId, gun: "3", gun_sira: 3, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 4, dukkan_id: dukkanId, gun: "4", gun_sira: 4, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 5, dukkan_id: dukkanId, gun: "5", gun_sira: 5, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 6, dukkan_id: dukkanId, gun: "6", gun_sira: 6, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 7, dukkan_id: dukkanId, gun: "0", gun_sira: 7, acilis: "09:00", kapanis: "18:00", kapali: true }
  ];
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
