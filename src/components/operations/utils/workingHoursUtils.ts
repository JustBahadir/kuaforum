import { CalismaSaati } from "@/lib/supabase/types";
import { gunSiralama } from "../constants/workingDays";

/**
 * Sort working hours by the predefined day order
 */
export function sortWorkingHours(hours: CalismaSaati[]): CalismaSaati[] {
  // Create a copy to avoid mutating the original array
  const sortedHours = [...hours];
  
  // Sort by gun_sira or fallback to gun ordering using gunSiralama
  sortedHours.sort((a, b) => {
    // First check if gun_sira exists on both items
    if (a.gun_sira !== undefined && b.gun_sira !== undefined) {
      return a.gun_sira - b.gun_sira;
    }
    
    // If gun_sira doesn't exist, use the gunSiralama mapping
    const aIndex = gunSiralama.indexOf(parseInt(a.gun));
    const bIndex = gunSiralama.indexOf(parseInt(b.gun));
    
    // If both days are in gunSiralama, sort by their position
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If one day is not in gunSiralama, prioritize the one that is
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    // If neither day is in gunSiralama (shouldn't happen), keep original order
    return 0;
  });
  
  return sortedHours;
}

/**
 * Creates default working hours for a shop
 */
export function createDefaultWorkingHours(dukkanId: number): CalismaSaati[] {
  console.log("Creating default working hours for dukkanId:", dukkanId);
  
  return gunSiralama.map((gun, index) => {
    // Convert day number to string for DB compatibility
    const gunStr = gun.toString();
    
    // Default to open 9-19 on all days except Sunday (0)
    const isOpen = gun !== 0;
    
    return {
      gun: gunStr,
      gun_sira: index,
      dukkan_id: dukkanId,
      kapali: !isOpen,
      acilis: isOpen ? "09:00" : null,
      kapanis: isOpen ? "19:00" : null,
      id: 0 // This will be replaced when saved to DB
    };
  });
}

/**
 * Generate default working hours for a shop
 */
export function generateDefaultWorkingHours(dukkanId: number): CalismaSaati[] {
  return [
    { id: 1, dukkan_id: dukkanId, gun: "1", gun_sira: 1, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 2, dukkan_id: dukkanId, gun: "2", gun_sira: 2, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 3, dukkan_id: dukkanId, gun: "3", gun_sira: 3, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 4, dukkan_id: dukkanId, gun: "4", gun_sira: 4, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 5, dukkan_id: dukkanId, gun: "5", gun_sira: 5, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 6, dukkan_id: dukkanId, gun: "6", gun_sira: 6, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 7, dukkan_id: dukkanId, gun: "0", gun_sira: 7, acilis: "09:00", kapanis: "18:00", kapali: true }
  ];
}

/**
 * Prepare working hour data for updates
 */
export function prepareHourUpdates(
  id: number, 
  updates: Partial<CalismaSaati>, 
  currentDay?: CalismaSaati,
  dukkanId?: number
): Partial<CalismaSaati> {
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
}

export function formatTime(time: string | null): string {
  if (!time) return "-";
  return time.substring(0, 5); // Format as "HH:MM"
}
