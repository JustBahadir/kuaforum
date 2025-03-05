
import { supabaseAdmin } from '../client';
import { Musteri } from '../types';

// Simplified customer service with better error handling
export const musteriServisi = {
  // Get all customers
  async hepsiniGetir() {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, phone, birthdate, created_at')
        .eq('role', 'customer')
        .order('first_name', { ascending: true });

      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Customer fetch error:", error);
      throw error;
    }
  },

  // Add a new customer with simpler error handling
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

      if (error) {
        console.error("Customer addition error:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Customer addition error:", error);
      throw error;
    }
  }
};
