
import { supabase } from '@/lib/supabase/client';
import { CalismaSaati } from '@/lib/supabase/types';
import { v4 as uuidv4 } from 'uuid';

// Varsayılan çalışma saatleri oluşturma
export const getDefaultWorkingHours = (dukkanId: string): CalismaSaati[] => {
  const gunler = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  
  return gunler.map(gun => ({
    id: uuidv4(),
    dukkan_id: dukkanId,
    gun,
    acilis: "09:00",
    kapanis: "18:00",
    kapali: gun === "Pazar",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};

// Çalışma saatleri servisi
export const calismaSaatleriServisi = {
  // Çalışma saatlerini getir
  getCalismaSaatleri: async (dukkanId: string): Promise<CalismaSaati[]> => {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('id');
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        // Çalışma saati bulunamadıysa varsayılan değerleri döndür
        return getDefaultWorkingHours(dukkanId);
      }
      
      return data as CalismaSaati[];
    } catch (error) {
      console.error('Çalışma saatleri alınırken hata:', error);
      // Hata durumunda varsayılan değerleri döndür
      return getDefaultWorkingHours(dukkanId);
    }
  },
  
  // Çalışma saatlerini güncelle
  updateCalismaSaatleri: async (calismaSaatleri: CalismaSaati[]): Promise<null> => {
    try {
      // Mevcutları sil
      const dukkanId = calismaSaatleri[0]?.dukkan_id;
      if (!dukkanId) {
        throw new Error('Geçersiz dükkan kimliği');
      }
      
      const { error: silmeHatasi } = await supabase
        .from('calisma_saatleri')
        .delete()
        .eq('dukkan_id', dukkanId);
      
      if (silmeHatasi) {
        throw silmeHatasi;
      }
      
      // Yenileri ekle
      const { error: eklemeHatasi } = await supabase
        .from('calisma_saatleri')
        .insert(calismaSaatleri as any);
      
      if (eklemeHatasi) {
        throw eklemeHatasi;
      }
      
      return null;
    } catch (error) {
      console.error('Çalışma saatleri güncellenirken hata:', error);
      throw error;
    }
  },
  
  // Geçici olarak aliased eski fonksiyonlar - geriye uyumluluk için
  dukkanSaatleriGetir: async (dukkanId: string) => {
    return await calismaSaatleriServisi.getCalismaSaatleri(dukkanId);
  },
  
  saatleriKaydet: async (calismaSaatleri: CalismaSaati[]) => {
    return await calismaSaatleriServisi.updateCalismaSaatleri(calismaSaatleri);
  },
  
  getCurrentDukkanId: async () => {
    // Aktif kullanıcının dükkan ID'sini getir
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Kullanıcı bulunamadı');
      
      const { data } = await supabase
        .from('isletmeler')
        .select('id')
        .eq('sahip_kimlik', user.id)
        .limit(1)
        .single();
      
      return data?.id;
    } catch (error) {
      console.error('Dükkan ID getirme hatası:', error);
      return null;
    }
  }
};
