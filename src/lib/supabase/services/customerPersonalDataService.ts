
import { supabase } from "@/lib/supabase/client";

export interface CustomerPersonalData {
  custom_notes: string;
  children_names: string[];
  spouse_name: string;
  preferences?: Record<string, any>;
  id?: number;
  musteri_id?: number;
  created_at?: string;
  updated_at?: string;
}

export const customerPersonalDataService = {
  /**
   * Müşterinin kişisel verilerini getirir
   */
  getCustomerPersonalData: async (customerId: number) => {
    try {
      const { data, error } = await supabase
        .from('musteri_verileri')
        .select('*')
        .eq('musteri_id', customerId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Müşteri verileri getirilirken hata:', error);
        throw error;
      }

      // Veri yoksa boş obje döndür
      return data || { 
        custom_notes: '', 
        children_names: [], 
        spouse_name: '',
        preferences: {} 
      };
    } catch (error) {
      console.error('Müşteri verileri getirilirken beklenmeyen hata:', error);
      return { 
        custom_notes: '', 
        children_names: [], 
        spouse_name: '',
        preferences: {} 
      };
    }
  },

  /**
   * Müşterinin kişisel verilerini günceller
   */
  updateCustomerPersonalData: async (customerId: number, data: any) => {
    try {
      // Önce veri var mı diye kontrol et
      const { data: existingData, error: checkError } = await supabase
        .from('musteri_verileri')
        .select('id')
        .eq('musteri_id', customerId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Müşteri verisi kontrolünde hata:', checkError);
        throw checkError;
      }

      // Mevcut veriyi al ve güncelle
      const { data: currentData } = await supabase
        .from('musteri_verileri')
        .select('*')
        .eq('musteri_id', customerId)
        .single();

      const updatedData = {
        ...currentData,
        ...data,
        musteri_id: customerId
      };

      let result;

      // Veri varsa güncelle, yoksa oluştur
      if (existingData) {
        const { data: updateResult, error: updateError } = await supabase
          .from('musteri_verileri')
          .update(updatedData)
          .eq('musteri_id', customerId)
          .select();

        if (updateError) {
          console.error('Müşteri verisi güncellenirken hata:', updateError);
          throw updateError;
        }

        result = updateResult;
      } else {
        const { data: insertResult, error: insertError } = await supabase
          .from('musteri_verileri')
          .insert([updatedData])
          .select();

        if (insertError) {
          console.error('Müşteri verisi eklenirken hata:', insertError);
          throw insertError;
        }

        result = insertResult;
      }

      return result ? result[0] : null;
    } catch (error) {
      console.error('Müşteri verisi güncellenirken beklenmeyen hata:', error);
      throw error;
    }
  }
};
