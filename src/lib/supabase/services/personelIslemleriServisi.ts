
import { supabase } from '../client';
import { PersonelIslemi } from '@/types/personnel';

export const personelIslemleriServisi = {
  personelIslemleriGetir: async (personelId: number) => {
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
      throw error;
    }
  },
  
  personelIslemiGetir: async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Personel işlemi getirme hatası:', error);
      throw error;
    }
  },
  
  personelIslemiEkle: async (islemiVerisi: Partial<PersonelIslemi>) => {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .insert([islemiVerisi])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Personel işlemi ekleme hatası:', error);
      throw error;
    }
  },
  
  personelIslemiGuncelle: async (id: number, updates: Partial<PersonelIslemi>) => {
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
  
  personelIslemiSil: async (id: number) => {
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
  },
  
  personelPerformansGetir: async (personelId?: number) => {
    try {
      let query = supabase
        .from('personel_performans')
        .select('*');
      
      if (personelId) {
        query = query.eq('id', personelId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Personel performans verisi getirme hatası:', error);
      throw error;
    }
  },
  
  // Add missing hepsiniGetir method to fix build errors
  hepsiniGetir: async () => {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Tüm personel işlemlerini getirme hatası:', error);
      throw error;
    }
  }
};
