
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkbjjcizncwkrouvoujw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tip tanımlamaları
export type Islem = {
  id: number;
  created_at?: string;
  islem_adi: string;
  fiyat: number;
  puan: number;
}

export type Musteri = {
  id: number;
  created_at?: string;
  musteri_no: string;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
}

// İşlemler servisi
export const islemServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('islemler')
      .select('*')
      .order('islem_adi');

    if (error) throw error;
    return data || [];
  },

  async ekle(islem: { islem_adi: string; fiyat: number; puan: number }) {
    const { data, error } = await supabase
      .from('islemler')
      .insert([{
        islem_adi: islem.islem_adi.toUpperCase(),
        fiyat: islem.fiyat,
        puan: islem.puan
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, islem: { islem_adi: string; fiyat: number; puan: number }) {
    const { data, error } = await supabase
      .from('islemler')
      .update({
        islem_adi: islem.islem_adi.toUpperCase(),
        fiyat: islem.fiyat,
        puan: islem.puan
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    const { error } = await supabase
      .from('islemler')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Müşteri servisi
export const musteriServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('musteriler')
      .select('*')
      .order('ad_soyad');

    if (error) throw error;
    return data || [];
  },

  async ara(aramaMetni: string) {
    const { data, error } = await supabase
      .from('musteriler')
      .select('*')
      .ilike('ad_soyad', `%${aramaMetni}%`)
      .order('ad_soyad');

    if (error) throw error;
    return data || [];
  },

  async ekle(musteri: Omit<Musteri, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('musteriler')
      .insert([musteri])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

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

  async sil(id: number) {
    const { error } = await supabase
      .from('musteriler')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
