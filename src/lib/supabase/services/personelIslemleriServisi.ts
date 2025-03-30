
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
    notlar?: string;
    randevu_id?: number;
  }) {
    try {
      console.log("Adding new personnel operation:", islemi);
      
      // Check if an operation with this randevu_id and islem_id already exists
      if (islemi.randevu_id && islemi.islem_id && islemi.personel_id) {
        const { data: existingOps } = await supabase
          .from('personel_islemleri')
          .select('id')
          .eq('randevu_id', islemi.randevu_id)
          .eq('islem_id', islemi.islem_id)
          .eq('personel_id', islemi.personel_id);
          
        if (existingOps && existingOps.length > 0) {
          console.log(`Operation already exists for randevu ID ${islemi.randevu_id} and islem ID ${islemi.islem_id}. Updating.`);
          
          // Update the existing record
          const { data: updatedOp, error: updateError } = await supabase
            .from('personel_islemleri')
            .update({
              tutar: islemi.tutar,
              puan: islemi.puan,
              prim_yuzdesi: islemi.prim_yuzdesi,
              odenen: islemi.odenen,
              aciklama: islemi.aciklama,
              notlar: islemi.notlar
            })
            .eq('id', existingOps[0].id)
            .select(`
              *,
              islem:islemler(*),
              personel:personel(*)
            `)
            .single();
            
          if (updateError) {
            console.error("Error updating existing operation:", updateError);
            throw updateError;
          }
            
          console.log("Successfully updated existing operation:", updatedOp);
          return updatedOp;
        }
      }
      
      // Prepare the insertion object
      const insertData = {
        personel_id: islemi.personel_id,
        islem_id: islemi.islem_id,
        tutar: islemi.tutar,
        puan: islemi.puan,
        prim_yuzdesi: islemi.prim_yuzdesi,
        odenen: islemi.odenen,
        aciklama: islemi.aciklama,
        musteri_id: islemi.musteri_id,
        notlar: islemi.notlar,
        randevu_id: islemi.randevu_id
      };
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .insert([insertData])
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
  async guncelle(id: number, updates: Partial<PersonelIslemi> & { notlar?: string }) {
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
