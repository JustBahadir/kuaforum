
import { supabase } from '../client';
import { PersonelIslemi } from '../types';

export const personelIslemleriServisi = {
  // Get all staff operations
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select(`
        *,
        islem:islemler(*),
        personel:personel(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get operations for a specific staff member
  async personelIslemleriGetir(personelId: number) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select(`
        *,
        islem:islemler(*),
        personel:personel(*)
      `)
      .eq('personel_id', personelId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get operations for a specific customer
  async musteriIslemleriGetir(musteriId: number) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select(`
        *,
        islem:islemler(*),
        personel:personel(*)
      `)
      .eq('musteri_id', musteriId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Add a new operation
  async ekle(islemi: Omit<PersonelIslemi, 'id' | 'created_at'> & { 
    musteri_id?: number; 
    tarih?: string; 
    notlar?: string 
  }) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .insert([islemi])
      .select(`
        *,
        islem:islemler(*),
        personel:personel(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Update an operation
  async guncelle(id: number, updates: Partial<PersonelIslemi>) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        islem:islemler(*),
        personel:personel(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Delete an operation
  async sil(id: number) {
    const { error } = await supabase
      .from('personel_islemleri')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
