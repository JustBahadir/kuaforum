
import { supabase } from "@/lib/supabase/client";
import type { Personel } from "@/lib/supabase/types";

export const personelServisi = {
  hepsiniGetir: async () => {
    const { data, error } = await supabase
      .from('personel')
      .select(`
        *,
        dukkan:dukkan_id(id, ad)
      `)
      .order('id', { ascending: true });
    
    if (error) {
      console.error("Personel listesi alınamadı:", error);
      throw error;
    }
    
    return data || [];
  },
  
  getirById: async (id: number) => {
    const { data, error } = await supabase
      .from('personel')
      .select(`
        *,
        dukkan:dukkan_id(id, ad)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Personel (id=${id}) alınamadı:`, error);
      throw error;
    }
    
    return data;
  },
  
  getirByAuthId: async (authId: string) => {
    const { data, error } = await supabase
      .from('personel')
      .select(`
        *,
        dukkan:dukkan_id(id, ad)
      `)
      .eq('auth_id', authId)
      .single();
    
    if (error) {
      console.error(`Personel (auth_id=${authId}) alınamadı:`, error);
      throw error;
    }
    
    return data;
  },
  
  ekle: async (personel: Omit<Personel, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('personel')
      .insert([personel])
      .select()
      .single();
    
    if (error) {
      console.error("Personel eklenemedi:", error);
      throw error;
    }
    
    return data;
  },
  
  guncelle: async (id: number, personel: Partial<Personel>) => {
    const { data, error } = await supabase
      .from('personel')
      .update(personel)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Personel (id=${id}) güncellenemedi:`, error);
      throw error;
    }
    
    return data;
  },
  
  sil: async (id: number) => {
    const { error } = await supabase
      .from('personel')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Personel (id=${id}) silinemedi:`, error);
      throw error;
    }
    
    return true;
  }
};
