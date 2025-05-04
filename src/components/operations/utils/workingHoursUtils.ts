
import { CalismaSaati } from "@/lib/supabase/temporaryTypes";

// Helper function to sort working hours by day of week
export const sortWorkingHours = (hours: CalismaSaati[]): CalismaSaati[] => {
  const dayOrder = {
    "Pazartesi": 1,
    "Salı": 2,
    "Çarşamba": 3,
    "Perşembe": 4,
    "Cuma": 5,
    "Cumartesi": 6,
    "Pazar": 7
  };

  return [...hours].sort((a, b) => {
    return (dayOrder[a.gun as keyof typeof dayOrder] || 0) - (dayOrder[b.gun as keyof typeof dayOrder] || 0);
  });
};

// Function to get default working hours
export const getDefaultWorkingHours = (dukkanId: string): CalismaSaati[] => {
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  return days.map((gun, index) => ({
    id: `temp-${index}`,
    dukkan_id: dukkanId,
    gun,
    acilis: '09:00',
    kapanis: '18:00',
    kapali: index >= 5 // Weekend days are closed by default
  }));
};
