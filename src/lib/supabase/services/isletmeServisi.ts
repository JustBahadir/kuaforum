
import { supabase } from '../client';
import { Isletme } from '../types';

export const isletmeServisi = {
  // Mevcut işletme bilgilerini getir
  async getir(isletmeKimlik: string): Promise<Isletme | null> {
    try {
      const { data, error } = await supabase
        .from('isletmeler')
        .select('*')
        .eq('kimlik', isletmeKimlik)
        .single();
      
      if (error) throw error;
      
      return data as Isletme;
    } catch (error) {
      console.error('İşletme getirilirken hata:', error);
      return null;
    }
  },
  
  // İşletme koduna göre getir
  async getirByKod(isletmeKodu: string): Promise<Isletme | null> {
    try {
      const { data, error } = await supabase
        .from('isletmeler')
        .select('*')
        .eq('kod', isletmeKodu)
        .single();
      
      if (error) throw error;
      
      return data as Isletme;
    } catch (error) {
      console.error('İşletme kodu ile getirilirken hata:', error);
      return null;
    }
  },
  
  // Kullanıcının işletmesini getir
  async kullaniciIsletmesiniGetir(): Promise<Isletme | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('isletmeler')
        .select('*')
        .eq('sahip_kimlik', user.id)
        .single();
      
      if (error) throw error;
      
      return data as Isletme;
    } catch (error) {
      console.error('Kullanıcı işletmesi getirilirken hata:', error);
      return null;
    }
  },

  // Tüm işletmeleri getir
  async hepsiniGetir(): Promise<Isletme[]> {
    try {
      const { data, error } = await supabase
        .from('isletmeler')
        .select('*');
      
      if (error) throw error;
      
      return data as Isletme[];
    } catch (error) {
      console.error('İşletmeler getirilirken hata:', error);
      return [];
    }
  },

  // Kullanıcının işletme kimliğini getir
  async getCurrentUserIsletmeId(): Promise<string | null> {
    try {
      const isletme = await this.kullaniciIsletmesiniGetir();
      return isletme?.kimlik || null;
    } catch (error) {
      console.error('Kullanıcı işletme kimliği getirilirken hata:', error);
      return null;
    }
  },
  
  // İşletme güncelle
  async guncelle(isletmeKimlik: string, guncelBilgiler: Partial<Isletme>): Promise<Isletme | null> {
    try {
      const { data, error } = await supabase
        .from('isletmeler')
        .update(guncelBilgiler)
        .eq('kimlik', isletmeKimlik)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Isletme;
    } catch (error) {
      console.error('İşletme güncellenirken hata:', error);
      return null;
    }
  },
  
  // Yeni işletme oluştur
  async olustur(isletme: Partial<Isletme>): Promise<Isletme | null> {
    try {
      const { data, error } = await supabase
        .from('isletmeler')
        .insert([isletme])
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Isletme;
    } catch (error) {
      console.error('İşletme oluşturulurken hata:', error);
      return null;
    }
  },
  
  // İşletme sil
  async sil(isletmeKimlik: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('isletmeler')
        .delete()
        .eq('kimlik', isletmeKimlik);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('İşletme silinirken hata:', error);
      return false;
    }
  }
};

// Geriye dönük uyumluluk için dukkanServisi adıyla da dışa aktarılır
export const dukkanServisi = isletmeServisi;
