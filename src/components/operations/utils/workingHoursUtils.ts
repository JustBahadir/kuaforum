
import { CalismaSaati } from "@/lib/supabase/types";

// Türkçe gün isimleri
export const gunler = [
  "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"
];

// Varsayılan çalışma saatleri oluştur
export const defaultCalismaSaatleriOlustur = (isletmeId: string): CalismaSaati[] => {
  return gunler.map((gun, index) => ({
    id: `${index + 1}`, // Bu id geçicidir, veritabanında otomatik oluşturulacak
    isletme_id: isletmeId,
    gun: gun,
    acilis: "09:00",
    kapanis: "18:00",
    kapali: gun === "Pazar", // Pazar günleri kapalı
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};
