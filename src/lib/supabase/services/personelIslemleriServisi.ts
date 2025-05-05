
import { supabase } from '../client';
import { PersonelIslemi } from '../temporaryTypes';

export const personelIslemleriServisi = {
  // Personele göre işlemleri getir
  async personeleGoreGetir(personelId: number): Promise<PersonelIslemi[]> {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*')
        .eq('personel_id', personelId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as PersonelIslemi[];
    } catch (error) {
      console.error('Personel işlemleri getirilirken hata:', error);
      return [];
    }
  },
  
  // Müşteriye göre işlemleri getir
  async musteriyeGoreGetir(musteriId: number): Promise<PersonelIslemi[]> {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*')
        .eq('musteri_id', musteriId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as PersonelIslemi[];
    } catch (error) {
      console.error('Müşteri işlemleri getirilirken hata:', error);
      return [];
    }
  },
  
  // İşlem oluştur
  async olustur(islem: Partial<PersonelIslemi>): Promise<PersonelIslemi | null> {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .insert([islem])
        .select()
        .single();
      
      if (error) throw error;
      
      return data as PersonelIslemi;
    } catch (error) {
      console.error('İşlem oluşturulurken hata:', error);
      return null;
    }
  },
  
  // İşlem güncelle
  async guncelle(islemId: number, islem: Partial<PersonelIslemi>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('personel_islemleri')
        .update(islem)
        .eq('id', islemId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('İşlem güncellenirken hata:', error);
      return false;
    }
  },
  
  // İşlem sil
  async sil(islemId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', islemId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('İşlem silinirken hata:', error);
      return false;
    }
  }
};

