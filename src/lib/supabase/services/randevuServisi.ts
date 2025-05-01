
import { supabase } from '@/lib/supabase/client';
import { authService } from '@/lib/auth/authService';

// Define the randevuServisi object with its methods
export const randevuServisi = {
  getirByMusteriId: async function(musteriId: number) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*, personel:personel_id(ad_soyad)')
        .eq('musteri_id', musteriId)
        .order('tarih', { ascending: false })
        .order('saat', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Müşteri randevuları getirme hatası:', error);
      throw error;
    }
  },
  
  // Common methods
  hepsiniGetir: async function(dukkanId?: number) {
    try {
      let query = supabase.from('randevular').select('*, personel:personel_id(ad_soyad)');
      
      if (dukkanId) {
        query = query.eq('dukkan_id', dukkanId);
      }
      
      const { data, error } = await query.order('tarih', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Randevu listesi getirme hatası:', error);
      return [];
    }
  },
  
  getir: async function(id: number) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*, personel:personel_id(ad_soyad)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Randevu getirme hatası:', error);
      return null;
    }
  },
  
  durumGuncelle: async function(randevuId: number, yeniDurum: string) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update({ durum: yeniDurum })
        .eq('id', randevuId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Randevu durumu güncelleme hatası:', error);
      throw error;
    }
  },
  
  kendiRandevulariniGetir: async function() {
    try {
      const user = await authService.getCurrentUser();
      
      if (!user) {
        throw new Error("Oturum açılmamış");
      }
      
      const { data, error } = await supabase
        .from('randevular')
        .select('*, personel:personel_id(ad_soyad)')
        .eq('customer_id', user.id)
        .order('tarih', { ascending: false })
        .order('saat', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kendi randevularını getirme hatası:', error);
      return [];
    }
  },
  
  // Add method needed by PersonnelXXX components
  personelIslemleriniGetir: async function(personelId: number) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*')
        .eq('personel_id', personelId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel işlemleri getirme hatası:', error);
      return [];
    }
  }
};
