
import { supabase } from '../client';
import { Musteri } from '../types';

export const musteriServisi = {
  async hepsiniGetir(dukkanId?: number) {
    try {
      let query = supabase
        .from('musteriler')
        .select('*');
      
      if (dukkanId) {
        query = query.eq('dukkan_id', dukkanId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error("Müşteriler getirme hatası:", error);
        throw error;
      }
      
      console.log(`${data.length} müşteri başarıyla getirildi`);
      return data || [];
    } catch (err) {
      console.error("Müşteriler getirme sırasında hata:", err);
      return [];
    }
  },
  
  async getirById(id: number): Promise<Musteri | null> {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .select('*, profiles(id)')  // Join with profiles to get auth_id
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`ID ${id} müşteri getirme hatası:`, error);
        return null;
      }
      
      // Extract auth_id and merge with customer data
      let customer = data as Musteri;
      if (data.profiles) {
        customer.auth_id = data.profiles.id;
      }
      
      return customer;
    } catch (err) {
      console.error(`ID ${id} müşteri getirme sırasında hata:`, err);
      return null;
    }
  },
  
  async ekle(musteri: Omit<Musteri, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .insert([musteri])
        .select();
      
      if (error) {
        console.error("Müşteri ekleme hatası:", error);
        throw error;
      }
      
      return data[0];
    } catch (err) {
      console.error("Müşteri eklenirken hata:", err);
      throw err;
    }
  },
  
  async guncelle(id: number, updates: Partial<Musteri>) {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Müşteri güncelleme hatası:", error);
        throw error;
      }
      
      return data[0];
    } catch (err) {
      console.error(`ID ${id} müşteri güncellenirken hata:`, err);
      throw err;
    }
  },
  
  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('musteriler')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Müşteri silme hatası:", error);
        throw error;
      }
      
      return true;
    } catch (err) {
      console.error(`ID ${id} müşteri silinirken hata:`, err);
      throw err;
    }
  }
};
