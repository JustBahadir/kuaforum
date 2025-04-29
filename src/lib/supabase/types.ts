
export interface Dukkan {
  id: number;
  kod: string;
  ad: string;
  adres?: string;
  acik_adres?: string;
  telefon?: string;
  logo_url?: string;
  sahibi_id: string;
  created_at: string;
  active: boolean;
}

export interface Personel {
  id: number;
  auth_id?: string;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  birth_date?: string;
  personel_no: string;
  maas: number;
  prim_yuzdesi: number;
  calisma_sistemi: string;
  created_at: string;
  dukkan_id: number;
  avatar_url?: string;
  iban?: string;
}

export interface Musteri {
  id: number;
  first_name: string;
  last_name?: string;
  phone?: string;
  birthdate?: string;
  dukkan_id: number;
  created_at: string;
  auth_id?: string;
}

export interface IslemKategori {
  id: number;
  kategori_adi: string;
  sira: number;
  created_at: string;
  dukkan_id: number;
}

export interface Islem {
  id: number;
  islem_adi: string;
  fiyat: number;
  kategori_id?: number;
  puan: number;
  maliyet?: number;
  sira: number;
  created_at: string;
  dukkan_id: number;
}

export interface PersonelIslemi {
  id: number;
  personel_id: number;
  islem_id?: number;
  tutar: number;
  odenen: number;
  prim_yuzdesi: number;
  puan: number;
  aciklama: string;
  musteri_id?: number;
  randevu_id?: number;
  created_at: string;
  notlar?: string;
  photos?: string[];
  dukkan_id: number;
}

export type RandevuDurumu = 'beklemede' | 'onaylandi' | 'iptal' | 'tamamlandi';

export interface Randevu {
  id: number;
  musteri_id?: number;
  personel_id?: number;
  tarih: string;
  saat: string;
  islemler: any;
  durum: RandevuDurumu;
  notlar?: string;
  created_at: string;
  customer_id?: string;
  dukkan_id: number;
}

export interface CalismaSaati {
  id: number;
  dukkan_id?: number;
  gun: string;
  gun_sira: number;
  acilis?: string;
  kapanis?: string;
  kapali?: boolean;
  created_at?: string;
}
