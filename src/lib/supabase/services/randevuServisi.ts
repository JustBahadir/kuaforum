
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
  },

  // Add the missing methods
  dukkanRandevulariniGetir: async function(dukkanId?: number) {
    try {
      const user = await authService.getCurrentUser();
      
      if (!user) {
        throw new Error("Oturum açılmamış");
      }
      
      let query = supabase
        .from('randevular')
        .select('*, personel:personel_id(ad_soyad)');
      
      if (dukkanId) {
        query = query.eq('dukkan_id', dukkanId);
      }
      
      const { data, error } = await query
        .order('tarih', { ascending: false })
        .order('saat', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Dükkan randevularını getirme hatası:', error);
      return [];
    }
  },

  randevuOlustur: async function(randevuData: any) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .insert([randevuData])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
      throw error;
    }
  },

  // Add method for tarihe göre randevular
  tariheGoreGetir: async function(tarih: string) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*, personel:personel_id(ad_soyad)')
        .eq('tarih', tarih)
        .order('saat', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Tarihe göre randevu getirme hatası:', error);
      return [];
    }
  },

  // Add method for guncelle
  guncelle: async function(randevuId: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update(updates)
        .eq('id', randevuId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Randevu güncelleme hatası:', error);
      throw error;
    }
  },

  // Add method for delete
  sil: async function(randevuId: number) {
    try {
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('id', randevuId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Randevu silme hatası:', error);
      throw error;
    }
  },
  
  // Customer appointments
  musteriRandevulari: async function(musteriId: number) {
    return this.getirByMusteriId(musteriId);
  },
  
  // Implement method to get current user's dukkan id
  getCurrentDukkanId: async function() {
    // Implement based on your auth structure
    return null;
  }
};
