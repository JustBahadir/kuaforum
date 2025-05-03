import { CalismaSaati } from "@/lib/supabase/types";

// Function to create default working hours for a shop
export function createDefaultWorkingHours(dukkanId: number): CalismaSaati[] {
  console.log("Creating default working hours for dukkanId:", dukkanId);
  
  // Default opening hours for each day of the week
  return [
    {
      gun: "1", // Pazartesi
      gun_sira: 1,
      dukkan_id: dukkanId,
      acilis: "09:00",
      kapanis: "19:00",
      kapali: false
    },
    {
      gun: "2", // Salı
      gun_sira: 2,
      dukkan_id: dukkanId,
      acilis: "09:00",
      kapanis: "19:00",
      kapali: false
    },
    {
      gun: "3", // Çarşamba
      gun_sira: 3,
      dukkan_id: dukkanId,
      acilis: "09:00",
      kapanis: "19:00",
      kapali: false
    },
    {
      gun: "4", // Perşembe
      gun_sira: 4,
      dukkan_id: dukkanId,
      acilis: "09:00",
      kapanis: "19:00",
      kapali: false
    },
    {
      gun: "5", // Cuma
      gun_sira: 5,
      dukkan_id: dukkanId,
      acilis: "09:00",
      kapanis: "19:00",
      kapali: false
    },
    {
      gun: "6", // Cumartesi
      gun_sira: 6,
      dukkan_id: dukkanId,
      acilis: "09:00",
      kapanis: "18:00",
      kapali: false
    },
    {
      gun: "0", // Pazar
      gun_sira: 0,
      dukkan_id: dukkanId,
      acilis: null,
      kapanis: null,
      kapali: true
    }
  ];
}

// Function to sort working hours by gun_sira
export function sortWorkingHours(hours: CalismaSaati[]): CalismaSaati[] {
  // Create a copy to prevent mutating the original array
  const sortedHours = [...hours];
  
  // Sort by gun_sira
  sortedHours.sort((a, b) => {
    const aOrder = a.gun_sira !== undefined ? a.gun_sira : parseInt(a.gun);
    const bOrder = b.gun_sira !== undefined ? b.gun_sira : parseInt(b.gun);
    
    return aOrder - bOrder;
  });
  
  return sortedHours;
}

// Function to format time for display
export function formatTime(time: string | null): string {
  if (!time) return "-";
  
  // If time already has the right format (HH:MM), return it
  if (time.match(/^\d{2}:\d{2}$/)) {
    return time;
  }
  
  // Otherwise try to parse and format it
  try {
    const [hour, minute] = time.split(':');
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  } catch (e) {
    return time; // Return original if parsing fails
  }
}
