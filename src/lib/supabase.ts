import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkbjjcizncwkrouvoujw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw';

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

// Personel tipi tanımı
export type Personel = {
  id: number;
  olusturulma_tarihi?: string;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  personel_no: string;
  maas: number;
  calisma_sistemi: 'haftalik' | 'aylik';
  prim_yuzdesi: number;
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

// Personel işlemleri için yardımcı fonksiyonlar
export const personelServisi = {
  // Tüm personeli getir
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('personel')
      .select('*')
      .order('olusturulma_tarihi', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Personel ara
  async ara(aramaMetni: string) {
    const { data, error } = await supabase
      .from('personel')
      .select('*')
      .or(`ad_soyad.ilike.%${aramaMetni}%,telefon.ilike.%${aramaMetni}%,eposta.ilike.%${aramaMetni}%`)
      .order('olusturulma_tarihi', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Yeni personel ekle
  async ekle(personel: Omit<Personel, 'id' | 'olusturulma_tarihi'>) {
    const { data, error } = await supabase
      .from('personel')
      .insert([personel])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Personel güncelle
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

  // Personel sil
  async sil(id: number) {
    const { error } = await supabase
      .from('personel')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
