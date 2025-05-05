
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
        .eq('isletme_kodu', isletmeKodu)
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
  }
};

// Geriye dönük uyumluluk için dukkanServisi adıyla da dışa aktarılır
export const dukkanServisi = isletmeServisi;
