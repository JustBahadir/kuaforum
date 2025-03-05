
import { supabaseAdmin } from '../client';
import { Musteri } from '../types';

// Simplified customer service that only handles basic operations
export const musteriServisi = {
  // Get all customers
  async hepsiniGetir() {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, phone, birthdate, created_at')
        .eq('role', 'customer')
        .order('first_name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Müşterileri getirme hatası:", error);
      throw error;
    }
  },

  // Add a new customer
  async ekle(musteri: Partial<Musteri>) {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert([{
          first_name: musteri.first_name || '',
          last_name: musteri.last_name || '',
          phone: musteri.phone || null,
          birthdate: musteri.birthdate || null,
          role: 'customer'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Müşteri ekleme hatası:", error);
      throw error;
    }
  }
};
