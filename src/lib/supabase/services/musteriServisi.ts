
import { supabase, supabaseAdmin } from '../client';
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
      
      // Filter by shop if a shop ID is provided
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

  // Add a new customer with shop association - using admin client to bypass RLS
  async ekle(musteri: Partial<Musteri>, dukkanId?: number) {
    try {
      // Using supabaseAdmin to bypass RLS for customer creation
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert([{
          first_name: musteri.first_name || '',
          last_name: musteri.last_name || null,
          phone: musteri.phone || null,
          birthdate: musteri.birthdate || null,
          role: 'customer',
          dukkan_id: dukkanId
        }])
        .select()
        .single();

      if (error) {
        console.error("Müşteri ekleme hatası:", error);
        throw error;
      }
      
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
