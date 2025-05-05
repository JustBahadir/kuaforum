
import { supabase } from '../client';
import { Isletme } from '../types';

export const isletmeServisi = {
  // Temel CRUD işlemleri
  async getir(isletmeKimlik: string): Promise<Isletme> {
    const { data, error } = await supabase
      .from('isletmeler')
      .select('*')
      .eq('kimlik', isletmeKimlik)
      .single();

    if (error) throw error;
    return data as Isletme;
  },
  
  // İşletmeyi kod ile getir
  async getirByKod(isletmeKodu: string): Promise<Isletme> {
    const { data, error } = await supabase
      .from('isletmeler')
      .select('*')
      .eq('kod', isletmeKodu)
      .maybeSingle();
      
    if (error) throw error;
    if (!data) throw new Error(`"${isletmeKodu}" kodlu işletme bulunamadı.`);
    
    return data as Isletme;
  },

  // Kullanıcının işletmesini getir
  async kullaniciIsletmesiniGetir(): Promise<Isletme | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Oturum bilgisi bulunamadı.');
    }
    
    const { data, error } = await supabase
      .from('isletmeler')
      .select('*')
      .eq('sahip_kimlik', user.id)
      .maybeSingle();
    
    if (error) throw error;
    return data as Isletme;
  },

  // Backward compatibility
  async kullaniciDukkaniniGetir(): Promise<Isletme | null> {
    return this.kullaniciIsletmesiniGetir();
  },

  // Tüm işletmeleri getir
  async hepsiniGetir(): Promise<Isletme[]> {
    const { data, error } = await supabase
      .from('isletmeler')
      .select('*')
      .order('ad', { ascending: true });
    
    if (error) throw error;
    return data as Isletme[];
  },
  
  // İşletme oluştur
  async ekle(isletme: Partial<Isletme>): Promise<Isletme> {
    const { data, error } = await supabase
      .from('isletmeler')
      .insert([isletme])
      .select()
      .single();
    
    if (error) throw error;
    return data as Isletme;
  },
  
  // İşletme güncelle
  async guncelle(isletmeKimlik: string, guncellenenIsletme: Partial<Isletme>): Promise<Isletme> {
    const { data, error } = await supabase
      .from('isletmeler')
      .update(guncellenenIsletme)
      .eq('kimlik', isletmeKimlik)
      .select()
      .single();
    
    if (error) throw error;
    return data as Isletme;
  },
  
  // İşletme sil
  async sil(isletmeKimlik: string): Promise<boolean> {
    const { error } = await supabase
      .from('isletmeler')
      .delete()
      .eq('kimlik', isletmeKimlik);
    
    if (error) throw error;
    return true;
  }
};
