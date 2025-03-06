
import { supabase, supabaseAdmin } from '../client';
import { Musteri } from '../types';

export const musteriServisi = {
  // Belirli bir dükkan için tüm müşterileri getir
  async hepsiniGetir(dukkanId?: number) {
    try {
      console.log("Müşteri listesi getiriliyor, dükkan ID:", dukkanId);
      
      let query = supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, phone, birthdate, created_at, dukkan_id')
        .eq('role', 'customer');
      
      if (dukkanId) {
        query = query.eq('dukkan_id', dukkanId);
      }

      const { data, error } = await query.order('first_name', { ascending: true });

      if (error) {
        console.error("Müşteri getirme hatası:", error);
        throw error;
      }
      
      console.log(`${data?.length || 0} müşteri başarıyla getirildi`);
      return data || [];
    } catch (error) {
      console.error("Müşteri getirme hatası:", error);
      throw error;
    }
  },

  // Dükkan ilişkili yeni müşteri ekle 
  async ekle(musteri: Partial<Musteri>, dukkanId?: number) {
    try {
      console.log("Müşteri ekleme başlatıldı:", { ...musteri, dukkanId });
      
      if (!dukkanId) {
        throw new Error("Dükkan ID bulunamadı. Müşteri eklenemez.");
      }
      
      // Müşteri verilerini hazırla
      const customerData = {
        first_name: musteri.first_name || '',
        last_name: musteri.last_name || null,
        phone: musteri.phone || null,
        birthdate: musteri.birthdate || null,
        role: 'customer',
        dukkan_id: dukkanId
      };
      
      console.log("Ekleniyor:", customerData);
      
      // doğrudan insert işlemini yap, hiçbir kontrol olmadan
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert([customerData])
        .select()
        .single();

      if (error) {
        console.error("Müşteri ekleme hatası:", error);
        throw new Error("Müşteri eklenirken bir hata oluştu: " + error.message);
      }
      
      console.log("Müşteri başarıyla eklendi:", data);
      return data;
    } catch (error) {
      console.error("Müşteri ekleme hatası:", error);
      throw error;
    }
  },
  
  // ID'ye göre tek müşteri getir
  async getirById(id: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('role', 'customer')
        .single();

      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Müşteri getirme hatası:", error);
      throw error;
    }
  }
};
