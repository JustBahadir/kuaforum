
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkbjjcizncwkrouvoujw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Personel tipi tanımı
export type Personel = {
  id: number;
  created_at?: string; // Supabase'in otomatik oluşturduğu alan
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  personel_no: string;
  maas: number;
  calisma_sistemi: 'haftalik' | 'aylik';
  prim_yuzdesi: number;
}

// Personel işlemleri için yardımcı fonksiyonlar
export const personelServisi = {
  // Tüm personeli getir
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('personel')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Personel getirme hatası:', error);
      throw error;
    }
    return data || [];
  },

  // Personel ara
  async ara(aramaMetni: string) {
    const { data, error } = await supabase
      .from('personel')
      .select('*')
      .or(`ad_soyad.ilike.%${aramaMetni}%,telefon.ilike.%${aramaMetni}%`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Personel arama hatası:', error);
      throw error;
    }
    return data || [];
  },

  // Yeni personel ekle
  async ekle(personel: Omit<Personel, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('personel')
      .insert([personel])
      .select()
      .single();
    
    if (error) {
      console.error('Personel ekleme hatası:', error);
      throw error;
    }
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
    
    if (error) {
      console.error('Personel güncelleme hatası:', error);
      throw error;
    }
    return data;
  },

  // Personel sil
  async sil(id: number) {
    const { error } = await supabase
      .from('personel')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Personel silme hatası:', error);
      throw error;
    }
  }
};
