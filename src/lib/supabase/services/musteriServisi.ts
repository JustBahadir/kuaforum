
import { supabase, supabaseAdmin } from '../client';
import { Musteri } from '../types';

export const musteriServisi = {
  // Fetch all customers for a specific shop
  async hepsiniGetir(dukkanId?: number) {
    try {
      console.log("Müşteri listesi getiriliyor, dükkan ID:", dukkanId);
      
      if (!dukkanId) {
        throw new Error("Dükkan ID bulunamadı. Müşteriler getirilemez.");
      }
      
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('first_name', { ascending: true });

      if (error) {
        console.error("Müşteri getirme hatası:", error);
        throw new Error(`Müşteri listesi alınamadı: ${error.message}`);
      }
      
      console.log(`${data?.length || 0} müşteri başarıyla getirildi`);
      return data || [];
    } catch (error: any) {
      console.error("Müşteri getirme hatası:", error);
      throw new Error(`Müşteri listesi alınamadı: ${error.message}`);
    }
  },

  // Add a new customer for a shop
  async ekle(musteri: Partial<Musteri>, dukkanId?: number) {
    try {
      console.log("Müşteri ekleme başlatıldı:", { ...musteri, dukkanId });
      
      if (!dukkanId) {
        throw new Error("Dükkan ID bulunamadı. Müşteri eklenemez.");
      }
      
      // Prepare customer data
      const customerData = {
        first_name: musteri.first_name,
        last_name: musteri.last_name || null,
        phone: musteri.phone || null,
        birthdate: musteri.birthdate || null,
        dukkan_id: dukkanId
      };
      
      console.log("Ekleniyor:", customerData);
      
      const { data, error } = await supabase
        .from('musteriler')
        .insert([customerData])
        .select();

      if (error) {
        console.error("Müşteri ekleme hatası:", error);
        throw new Error(`Müşteri eklenirken bir hata oluştu: ${error.message}`);
      }
      
      console.log("Müşteri başarıyla eklendi:", data?.[0]);
      return data?.[0] || null;
    } catch (error: any) {
      console.error("Müşteri ekleme hatası:", error);
      throw error;
    }
  },
  
  // Get a single customer by ID
  async getirById(id: number) {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Müşteri getirme hatası:", error);
        throw new Error(`Müşteri bulunamadı: ${error.message}`);
      }
      
      return data;
    } catch (error: any) {
      console.error("Müşteri getirme hatası:", error);
      throw new Error(`Müşteri alınamadı: ${error.message}`);
    }
  },
  
  // Update a customer
  async guncelle(id: number, musteri: Partial<Musteri>) {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .update({
          first_name: musteri.first_name,
          last_name: musteri.last_name,
          phone: musteri.phone,
          birthdate: musteri.birthdate
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error("Müşteri güncelleme hatası:", error);
        throw new Error(`Müşteri güncellenirken bir hata oluştu: ${error.message}`);
      }
      
      return data?.[0] || null;
    } catch (error: any) {
      console.error("Müşteri güncelleme hatası:", error);
      throw error;
    }
  },
  
  // Delete a customer
  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('musteriler')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Müşteri silme hatası:", error);
        throw new Error(`Müşteri silinirken bir hata oluştu: ${error.message}`);
      }
      
      return true;
    } catch (error: any) {
      console.error("Müşteri silme hatası:", error);
      throw error;
    }
  }
};
