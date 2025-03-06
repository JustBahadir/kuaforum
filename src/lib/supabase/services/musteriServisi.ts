
import { supabase, supabaseAdmin, testServiceRoleKeyValidity } from '../client';
import { Musteri } from '../types';

export const musteriServisi = {
  // Get all customers for a specific shop
  async hepsiniGetir(dukkanId?: number) {
    try {
      let query = supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, phone, birthdate, created_at, dukkan_id')
        .eq('role', 'customer')
        .order('first_name', { ascending: true });
      
      if (dukkanId) {
        query = query.eq('dukkan_id', dukkanId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Müşteri getirme hatası:", error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Müşteri getirme hatası:", error);
      throw error;
    }
  },

  // Add a new customer with shop association
  async ekle(musteri: Partial<Musteri>, dukkanId?: number) {
    try {
      console.log("Müşteri ekleme başlatıldı:", { musteri, dukkanId });
      
      if (!dukkanId) {
        throw new Error("Dükkan ID bulunamadı. Müşteri eklenemez.");
      }
      
      // First, check if the service role key is valid
      const isValidKey = await testServiceRoleKeyValidity();
      if (!isValidKey) {
        throw new Error("Servis yetki anahtarı doğrulanamadı. Sistem ayarlarını kontrol edin.");
      }
      
      // Prepare customer data
      const customerData = {
        first_name: musteri.first_name || '',
        last_name: musteri.last_name || null,
        phone: musteri.phone || null,
        birthdate: musteri.birthdate || null,
        role: 'customer',
        dukkan_id: dukkanId
      };
      
      console.log("Inserting customer data via supabaseAdmin:", customerData);
      
      // Use supabaseAdmin client with explicit headers to ensure service role is used
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert([customerData])
        .select()
        .single();

      if (error) {
        console.error("Müşteri ekleme hatası:", error);
        
        // Specific error handling for common issues
        if (error.message && error.message.includes("Invalid API key")) {
          console.error("API anahtarı hatası tespit edildi. Service role key kontrol edilmeli.");
          throw new Error("API anahtarı geçersiz. Lütfen Supabase proje ayarlarınızı kontrol edin.");
        }
        
        if (error.code === "42501" || error.message.includes("permission denied")) {
          throw new Error("Yetkilendirme hatası. Row-Level Security politikalarını kontrol edin.");
        }
        
        if (error.code === "23505") {
          throw new Error("Bu müşteri zaten mevcut.");
        }
        
        throw error;
      }
      
      console.log("Müşteri başarıyla eklendi:", data);
      return data;
    } catch (error) {
      console.error("Müşteri ekleme hatası:", error);
      throw error;
    }
  },
  
  // Get a single customer by ID
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
