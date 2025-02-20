
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkbjjcizncwkrouvoujw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tip tanımlamaları
export type Musteri = {
  id: number;
  created_at?: string;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  musteri_no: string;
}

export type Personel = {
  id: number;
  created_at?: string;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  personel_no: string;
  maas: number;
  calisma_sistemi: 'haftalik' | 'aylik';
  prim_yuzdesi: number;
}

export type Islem = {
  id: number;
  created_at?: string;
  islem_adi: string;
  fiyat: number;
  puan: number;
}

export type PersonelIslemi = {
  id: number;
  created_at?: string;
  personel_id: number;
  islem_id: number;
  aciklama: string;
  tutar: number;
  prim_yuzdesi: number;
  odenen: number;
  islem?: Islem;
}

// Müşteri servisi 
export const musteriServisi = {
  // Tüm müşterileri getir
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('musteriler')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Müşteri ara
  async ara(aramaMetni: string) {
    const { data, error } = await supabase
      .from('musteriler')
      .select('*')
      .or(`ad_soyad.ilike.%${aramaMetni}%,telefon.ilike.%${aramaMetni}%,eposta.ilike.%${aramaMetni}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Yeni müşteri ekle
  async ekle(musteri: Omit<Musteri, 'id' | 'created_at'>) {
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

// Personel servisi
export const personelServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('personel')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async ara(aramaMetni: string) {
    const { data, error } = await supabase
      .from('personel')
      .select('*')
      .or(`ad_soyad.ilike.%${aramaMetni}%,telefon.ilike.%${aramaMetni}%,eposta.ilike.%${aramaMetni}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async ekle(personel: Omit<Personel, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('personel')
      .insert([personel])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

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

  async sil(id: number) {
    const { error } = await supabase
      .from('personel')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// İşlemler servisi
export const islemServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('islemler')
      .select('*')
      .order('islem_adi', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async ekle(islem: Omit<Islem, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('islemler')
      .insert([{
        islem_adi: islem.islem_adi.trim().toUpperCase(),
        fiyat: Number(islem.fiyat),
        puan: Number(islem.puan)
      }])
      .select()
      .single();
    
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    
    if (!data) {
      throw new Error("İşlem eklenemedi");
    }
    
    return data;
  },

  async guncelle(id: number, islem: Partial<Islem>) {
    const { data, error } = await supabase
      .from('islemler')
      .update({
        ...islem,
        islem_adi: islem.islem_adi ? islem.islem_adi.trim().toUpperCase() : undefined,
        fiyat: islem.fiyat ? Number(islem.fiyat) : undefined,
        puan: islem.puan ? Number(islem.puan) : undefined
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

// Personel işlemleri servisi
export const personelIslemleriServisi = {
  async hepsiniGetir(personelId: number) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select('*, islemler(*)')
      .eq('personel_id', personelId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async ekle(islem: Omit<PersonelIslemi, 'id' | 'created_at' | 'islem'>) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .insert([islem])
      .select('*, islemler(*)')
      .single();
    
    if (error) throw error;
    return data;
  },

  async guncelle(id: number, islem: Partial<PersonelIslemi>) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .update(islem)
      .eq('id', id)
      .select('*, islemler(*)')
      .single();
    
    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    const { error } = await supabase
      .from('personel_islemleri')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
