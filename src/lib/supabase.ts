
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://abcdefghijk.supabase.co';    // Bu URL'yi kendi Supabase URL'niz ile değiştirin
const supabaseKey = 'your-anon-key';                      // Bu key'i kendi Supabase anon/public key'iniz ile değiştirin

export const supabase = createClient(supabaseUrl, supabaseKey);

// Müşteri tipi tanımı
export type Customer = {
  id: number;
  created_at?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  customer_number: string;
}

// Müşteri işlemleri için yardımcı fonksiyonlar
export const customersService = {
  // Tüm müşterileri getir
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Müşteri ara
  async search(query: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Yeni müşteri ekle
  async create(customer: Omit<Customer, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Müşteri güncelle
  async update(id: number, customer: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Müşteri sil
  async delete(id: number) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
