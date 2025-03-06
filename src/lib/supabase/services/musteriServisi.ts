
import { supabase, supabaseAdmin } from '../client';
import { Musteri } from '../types';

export const musteriServisi = {
  // Belirli bir dükkan için tüm müşterileri getir
  async hepsiniGetir(dukkanId?: number) {
    try {
      console.log("Müşteri listesi getiriliyor, dükkan ID:", dukkanId);
      
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, phone, birthdate, created_at, dukkan_id')
        .eq('role', 'customer');
      
      if (dukkanId) {
        query = query.eq('dukkan_id', dukkanId);
      }

      const { data, error } = await query.order('first_name', { ascending: true });

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
      
      // Kullanıcı RLS politikalarını bypass etmek için supabaseAdmin kullanıyoruz
      // Bu şekilde "infinite recursion" hatası önlenmiş olur
      const { data, error } = await supabaseAdmin
        .from('profiles')
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
  
  // ID'ye göre tek müşteri getir
  async getirById(id: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('role', 'customer')
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
  }
};
