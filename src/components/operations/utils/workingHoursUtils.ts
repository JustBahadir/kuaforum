
import { v4 as uuidv4 } from 'uuid';
import { CalismaSaati } from '@/lib/supabase/types';

// Varsayılan çalışma saatlerini oluştur
export const getDefaultWorkingHours = (dukkanId: string): CalismaSaati[] => {
  const gunler = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  const simdikiZaman = new Date().toISOString();
  
  return gunler.map((gun): CalismaSaati => ({
    id: uuidv4(),
    dukkan_id: dukkanId,
    gun,
    acilis: "09:00",
    kapanis: "18:00",
    kapali: gun === "Pazar",
    created_at: simdikiZaman,
    updated_at: simdikiZaman
  }));
};

// Çalışma saatlerini sıfırla
export const resetWorkingHours = (dukkanId: string): CalismaSaati[] => {
  return getDefaultWorkingHours(dukkanId);
};

// Türkçe gün isimleri
export const gunIsimleri = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar"
];
