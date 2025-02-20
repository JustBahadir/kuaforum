
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'BURAYA-KOPYALADIGINIZ-PROJECT-URL';    // Kopyaladığınız Project URL'i buraya yapıştırın
const supabaseKey = 'BURAYA-KOPYALADIGINIZ-ANON-KEY';      // Kopyaladığınız anon/public key'i buraya yapıştırın

export const supabase = createClient(supabaseUrl, supabaseKey);

// Müşteri tipi tanımı
export type Musteri = {
  id: number;
  olusturulma_tarihi?: string;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  musteri_no: string;
}

// Müşteri işlemleri için yardımcı fonksiyonlar
export const musteriServisi = {
  // Tüm müşterileri getir
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('musteriler')
      .select('*')
      .order('olusturulma_tarihi', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Müşteri ara
  async ara(aramaMetni: string) {
    const { data, error } = await supabase
      .from('musteriler')
      .select('*')
      .or(`ad_soyad.ilike.%${aramaMetni}%,telefon.ilike.%${aramaMetni}%,eposta.ilike.%${aramaMetni}%`)
      .order('olusturulma_tarihi', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Yeni müşteri ekle
  async ekle(musteri: Omit<Musteri, 'id' | 'olusturulma_tarihi'>) {
    const { data, error } = await supabase
      .from('musteriler')
      .insert([musteri])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Müşteri güncelle
  async guncelle(id: number, musteri: Partial<Musteri>) {
    const { data, error } = await supabase
      .from('musteriler')
      .update(musteri)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Müşteri sil
  async sil(id: number) {
    const { error } = await supabase
      .from('musteriler')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
