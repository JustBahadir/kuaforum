
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
      
      // First try to get the customer data with a join to profiles
      const { data, error } = await supabase
        .from('musteriler')
        .select(`
          *,
          profile:profiles(id)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`ID ${id} müşteri getirme hatası:`, error);
        return null;
      }
      
      console.log(`Müşteri ID ${id} verisi:`, data);
      
      // If profile data exists, extract auth_id
      let customer = { ...data } as Musteri;
      if (data.profile) {
        customer.auth_id = data.profile.id;
        console.log(`Müşteri auth_id bulundu: ${customer.auth_id}`);
      } else {
        console.log(`Müşteri için auth_id bulunamadı, profiles tablosunda manuel arama yapılıyor`);
        
        // If no profile record found through join, try to find a matching profile by name and phone
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, phone')
          .eq('first_name', data.first_name)
          .eq('phone', data.phone || '')
          .maybeSingle();
        
        if (!profilesError && profilesData) {
          customer.auth_id = profilesData.id;
          console.log(`Profiles tablosunda eşleşen kullanıcı bulundu: ${customer.auth_id}`);
        } else {
          console.log(`Profiles tablosunda eşleşen kullanıcı bulunamadı`);
        }
      }
      
      console.log(`Müşteri verisi hazırlandı:`, customer);
      return customer;
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
