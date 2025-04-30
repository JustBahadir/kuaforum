
import { supabase } from '../client';

export const dukkanServisi = {
  async getirById(id: number) {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error(`ID ${id} dükkan getirme hatası:`, error);
        throw error;
      }
      
      return data;
    } catch (err) {
      console.error(`ID ${id} dükkan getirme sırasında hata:`, err);
      throw err;
    }
  },
  
  async getirByKod(kod: string) {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('*')
        .eq('kod', kod)
        .maybeSingle();
      
      if (error) {
        console.error(`Kod ${kod} dükkan getirme hatası:`, error);
        throw error;
      }
      
      return data;
    } catch (err) {
      console.error(`Kod ${kod} dükkan getirme sırasında hata:`, err);
      throw err;
    }
  },
  
  async kullaniciDukkaniniGetir() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Check if user is an owner
      const { data: dukkanData, error: dukkanError } = await supabase
        .from('dukkanlar')
        .select('*')
        .eq('sahibi_id', user.id)
        .maybeSingle();
      
      if (dukkanData) return dukkanData;
      
      // If not an owner, check if user is staff
      const { data: personelData, error: personelError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      if (personelData?.dukkan_id) {
        const { data: dukkan } = await this.getirById(personelData.dukkan_id);
        return dukkan;
      }
      
      // Check profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileData?.dukkan_id) {
        const { data: dukkan } = await this.getirById(profileData.dukkan_id);
        return dukkan;
      }
      
      return null;
    } catch (err) {
      console.error("Kullanıcı dükkan bilgisi getirme hatası:", err);
      return null;
    }
  },
  
  async hepsiniGetir() {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Dükkanları getirme hatası:", error);
        throw error;
      }
      
      return data || [];
    } catch (err) {
      console.error("Dükkanları getirme sırasında hata:", err);
      return [];
    }
  }
};
