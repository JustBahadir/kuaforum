
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
    randevu_id?: number;
    tarih?: string; 
    notlar?: string;
    photos?: string[];
  }) {
    // Ensure we're not adding more than 4 photos
    if (islemi.photos && islemi.photos.length > 4) {
      islemi.photos = islemi.photos.slice(0, 4);
    }
    
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
    // Ensure we're not adding more than 4 photos
    if (updates.photos && updates.photos.length > 4) {
      updates.photos = updates.photos.slice(0, 4);
    }
    
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
  },

  // Update operation photos
  async updatePhotos(id: number, photos: string[]) {
    // Ensure we're not adding more than 4 photos
    if (photos.length > 4) {
      photos = photos.slice(0, 4);
    }
    
    const { data, error } = await supabase
      .from('personel_islemleri')
      .update({ photos })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  
  // Get operations by appointment
  async getByRandevuId(randevuId: number) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select(`
        *,
        islem:islemler(*),
        personel:personel(*)
      `)
      .eq('randevu_id', randevuId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
  
  // Get operations for a specific staff member within a date range
  async tarihAraliginaGoreGetir(personelId: number, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select(`
        *,
        islem:islemler(*),
        personel:personel(*)
      `)
      .eq('personel_id', personelId)
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
