
import { supabase } from '../client';
import { PersonelIslemi } from '../types';

export const personelIslemleriServisi = {
  // Get all staff operations
  async hepsiniGetir() {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          islem:islemler(*),
          personel:personel(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching all personnel operations:", error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} personnel operations`);
      return data || [];
    } catch (error) {
      console.error("Error in hepsiniGetir:", error);
      return [];
    }
  },

  // Get operations for a specific staff member
  async personelIslemleriGetir(personelId: number) {
    try {
      console.log(`Fetching operations for personnel ID: ${personelId}`);
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          islem:islemler(*),
          personel:personel(*)
        `)
        .eq('personel_id', personelId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching operations for personnel ID ${personelId}:`, error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} operations for personnel ID: ${personelId}`);
      return data || [];
    } catch (error) {
      console.error("Error in personelIslemleriGetir:", error);
      return [];
    }
  },

  // Get operations for a specific customer
  async musteriIslemleriGetir(musteriId: number) {
    try {
      console.log(`Fetching operations for customer ID: ${musteriId}`);
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          islem:islemler(*),
          personel:personel(*)
        `)
        .eq('musteri_id', musteriId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching operations for customer ID ${musteriId}:`, error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} operations for customer ID: ${musteriId}`);
      return data || [];
    } catch (error) {
      console.error("Error in musteriIslemleriGetir:", error);
      return [];
    }
  },

  // Add a new operation
  async ekle(islemi: Omit<PersonelIslemi, 'id' | 'created_at'> & { 
    musteri_id?: number; 
    tarih?: string; 
    notlar?: string 
  }) {
    try {
      console.log("Adding new personnel operation:", islemi);
      const { data, error } = await supabase
        .from('personel_islemleri')
        .insert([islemi])
        .select(`
          *,
          islem:islemler(*),
          personel:personel(*)
        `)
        .single();

      if (error) {
        console.error("Error adding personnel operation:", error);
        throw error;
      }
      
      console.log("Successfully added personnel operation:", data);
      return data;
    } catch (error) {
      console.error("Error in ekle:", error);
      throw error;
    }
  },

  // Update an operation
  async guncelle(id: number, updates: Partial<PersonelIslemi>) {
    try {
      console.log(`Updating operation ID ${id}:`, updates);
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

      if (error) {
        console.error(`Error updating operation ID ${id}:`, error);
        throw error;
      }
      
      console.log(`Successfully updated operation ID ${id}:`, data);
      return data;
    } catch (error) {
      console.error("Error in guncelle:", error);
      throw error;
    }
  },

  // Delete an operation
  async sil(id: number) {
    try {
      console.log(`Deleting operation ID: ${id}`);
      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting operation ID ${id}:`, error);
        throw error;
      }
      
      console.log(`Successfully deleted operation ID: ${id}`);
      return true;
    } catch (error) {
      console.error("Error in sil:", error);
      throw error;
    }
  }
};
