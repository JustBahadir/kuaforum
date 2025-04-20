
import { supabase } from '../client';
import { Dukkan } from '../types';

export const isletmeServisi = {
  async kullanicininIsletmesi(userId: string) {
    const { data, error } = await supabase
      .from('dukkanlar')
      .select('*')
      .eq('sahibi_id', userId)
      .single();
    
    if (error) {
      console.error("İşletme getirme hatası:", error);
      return null;
    }
    
    return data;
  },
  
  async personelAuthIdIsletmesi(authId: string) {
    // First get the personnel record with this auth_id
    const { data: personel, error: personelError } = await supabase
      .from('personel')
      .select('dukkan_id')
      .eq('auth_id', authId)
      .single();
    
    if (personelError || !personel?.dukkan_id) {
      console.error("Personel işletme bilgisi hatası:", personelError);
      return null;
    }
    
    // Now get the shop with this id
    const { data: isletme, error } = await supabase
      .from('dukkanlar')
      .select('*')
      .eq('id', personel.dukkan_id)
      .single();
    
    if (error) {
      console.error("İşletme getirme hatası:", error);
      return null;
    }
    
    return isletme;
  },

  async getirById(isletmeId: number) {
    const { data, error } = await supabase
      .from('dukkanlar')
      .select('*')
      .eq('id', isletmeId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  // Add alias for getirById to be accessible as getir
  async getir(isletmeId: number) {
    return this.getirById(isletmeId);
  },
  
  async getirByKod(kod: string) {
    const { data, error } = await supabase
      .from('dukkanlar')
      .select('*')
      .eq('kod', kod)
      .eq('active', true)
      .single();
    
    if (error) {
      console.error("İşletme kodu ile getirme hatası:", error);
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
  
  async isletmeEkle(isletme: Omit<Dukkan, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('dukkanlar')
      .insert([isletme])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  async ekle(isletme: Omit<Dukkan, 'id' | 'created_at'>) {
    return this.isletmeEkle(isletme);
  },

  async isletmeyiGuncelle(isletmeId: number, guncellemeler: Partial<Dukkan>) {
    const { data, error } = await supabase
      .from('dukkanlar')
      .update(guncellemeler)
      .eq('id', isletmeId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  // Add alias for isletmeyiGuncelle to be accessible as guncelle
  async guncelle(isletmeId: number, guncellemeler: Partial<Dukkan>) {
    return this.isletmeyiGuncelle(isletmeId, guncellemeler);
  },
  
  async isletmeSil(isletmeId: number) {
    // Instead of deleting, just mark it as inactive
    const { data, error } = await supabase
      .from('dukkanlar')
      .update({ active: false })
      .eq('id', isletmeId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }
};

