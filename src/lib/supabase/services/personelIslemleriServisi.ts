
import { supabase } from '@/lib/supabase/client';

// Define the personelIslemleriServisi object with its methods
export const personelIslemleriServisi = {
  getCurrentDukkanId: async function() {
    // Implementation depends on how you manage the current dukkan_id
    // For example, from local storage or from user profile
    return null; // Placeholder
  },
  
  hepsiniGetir: async function(dukkanId?: number) {
    try {
      let query = supabase.from('personel_islemleri').select('*, personel:personel_id(ad_soyad)');
      
      if (dukkanId) {
        // Assuming personel_islemleri has a dukkan_id
        query = query.eq('dukkan_id', dukkanId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel işlemleri listesi getirme hatası:', error);
      return [];
    }
  },
  
  getir: async function(id: number) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*, personel:personel_id(ad_soyad)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Personel işlemi getirme hatası:', error);
      return null;
    }
  },
  
  // Method for getting operations by personnel ID
  personelIslemleriniGetir: async function(personelId: number) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*, islem:islem_id(*), musteri(*)')
        .eq('personel_id', personelId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel işlemleri getirme hatası:', error);
      return [];
    }
  },
  
  // Alias for personelIslemleriniGetir to fix the naming inconsistency
  personelIslemleriGetir: async function(personelId: number) {
    return this.personelIslemleriniGetir(personelId);
  },
  
  // Method for getting operations by customer ID
  musteriIslemleriniGetir: async function(musteriId: number) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*, personel:personel_id(ad_soyad), islem:islem_id(*)')
        .eq('musteri_id', musteriId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Müşteri işlemleri getirme hatası:', error);
      return [];
    }
  },
  
  ekle: async function(islem: any) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .insert([islem])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Personel işlemi ekleme hatası:', error);
      throw error;
    }
  },
  
  guncelle: async function(id: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Personel işlemi güncelleme hatası:', error);
      throw error;
    }
  },
  
  sil: async function(id: number) {
    try {
      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Personel işlemi silme hatası:', error);
      throw error;
    }
  }
};
