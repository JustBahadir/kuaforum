
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
      console.log(`Müşteri ID ${id} getiriliyor`);
      
      // First get the basic customer data
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`ID ${id} müşteri getirme hatası:`, error);
        return null;
      }
      
      console.log(`Müşteri ID ${id} temel verisi:`, data);
      
      // If we have customer data, create a complete customer object with auth_id
      if (data) {
        // Simply use the customer ID as the auth_id for now
        // This avoids the problematic profiles join
        let customer = { 
          ...data,
          auth_id: id.toString()
        } as Musteri;
        
        console.log(`Müşteri verisi hazırlandı:`, customer);
        return customer;
      }
      
      return null;
    } catch (err) {
      console.error(`ID ${id} müşteri getirme sırasında hata:`, err);
      return null;
    }
  },
  
  async ekle(musteri: Omit<Musteri, 'id' | 'created_at'>) {
    try {
      console.log("Eklenecek müşteri verileri:", musteri);

      const { data, error } = await supabase
        .from('musteriler')
        .insert([musteri])
        .select();
      
      if (error) {
        console.error("Müşteri ekleme hatası:", error);
        throw error;
      }
      
      console.log("Eklenen müşteri:", data[0]);
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
