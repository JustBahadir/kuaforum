
import { supabase } from '../client';
import { Personel } from '../types';

export const personelServisi = {
  async hepsiniGetir() {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*');

      if (error) {
        console.error("Personel listesi alınırken hata:", error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Personel listesi alınırken hata:", error);
      throw error;
    }
  },

  async getirById(id: number) {
    try {
      console.log("Personel getiriliyor, ID:", id);
      
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Personel getirme hatası:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Personel bulunamadı");
      }
      
      return data;
    } catch (error) {
      console.error("Personel getirme hatası:", error);
      throw error;
    }
  },

  async getirByAuthId(authId: string) {
    // Get personnel by auth ID
    const { data, error } = await supabase
      .from('personel')
      .select('*, dukkan(*)')
      .eq('auth_id', authId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async ekle(personel: Omit<Personel, "id" | "created_at">) {
    const { data, error } = await supabase
      .from('personel')
      .insert([personel])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, personel: Partial<Personel>) {
    const { data, error } = await supabase
      .from('personel')
      .update(personel)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    const { error } = await supabase
      .from('personel')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
