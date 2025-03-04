
import { supabase } from '../client';
import { Dukkan } from '../types';

export const dukkanServisi = {
  async kullanicininDukkani(userId: string) {
    const { data, error } = await supabase
      .from('dukkanlar')
      .select('*')
      .eq('sahibi_id', userId)
      .single();
    
    if (error) {
      console.error("Dükkan getirme hatası:", error);
      return null;
    }
    
    return data;
  },
  
  async personelAuthIdDukkani(authId: string) {
    // First get the personnel record with this auth_id
    const { data: personel, error: personelError } = await supabase
      .from('personel')
      .select('dukkan_id')
      .eq('auth_id', authId)
      .single();
    
    if (personelError || !personel?.dukkan_id) {
      console.error("Personel dükkan bilgisi hatası:", personelError);
      return null;
    }
    
    // Now get the shop with this id
    const { data: dukkan, error } = await supabase
      .from('dukkanlar')
      .select('*')
      .eq('id', personel.dukkan_id)
      .single();
    
    if (error) {
      console.error("Dükkan getirme hatası:", error);
      return null;
    }
    
    return dukkan;
  },

  async getirById(dukkanId: number) {
    const { data, error } = await supabase
      .from('dukkanlar')
      .select('*')
      .eq('id', dukkanId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  async getirByKod(kod: string) {
    const { data, error } = await supabase
      .from('dukkanlar')
      .select('*')
      .eq('kod', kod)
      .eq('active', true)
      .single();
    
    if (error) {
      console.error("Dükkan kodu ile getirme hatası:", error);
      return null;
    }
    
    return data;
  },
  
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('dukkanlar')
      .select('*')
      .eq('active', true)
      .order('ad');
    
    if (error) {
      throw error;
    }
    
    return data || [];
  },
  
  async dukkanEkle(dukkan: Omit<Dukkan, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('dukkanlar')
      .insert([dukkan])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  async ekle(dukkan: Omit<Dukkan, 'id' | 'created_at'>) {
    return this.dukkanEkle(dukkan);
  },

  async dukkaniGuncelle(dukkanId: number, guncellemeler: Partial<Dukkan>) {
    const { data, error } = await supabase
      .from('dukkanlar')
      .update(guncellemeler)
      .eq('id', dukkanId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  async dukkanSil(dukkanId: number) {
    // Instead of deleting, just mark it as inactive
    const { data, error } = await supabase
      .from('dukkanlar')
      .update({ active: false })
      .eq('id', dukkanId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }
};
