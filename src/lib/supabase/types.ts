
export interface CalismaSaati {
  id: number | string;
  dukkan_id: number;
  gun: string;
  gun_sira: number;
  acilis: string | null;
  kapanis: string | null;
  kapali: boolean;
}

export interface KategoriDto {
  id: number;
  kategori_adi: string;
  dukkan_id: number;
  sira: number;
  created_at?: string;
}

export interface IslemDto {
  id: number;
  islem_adi: string;
  fiyat: number;
  maliyet?: number;
  puan: number;
  kategori_id: number;
  dukkan_id: number;
  sira: number;
  created_at?: string;
  kategori?: {
    id: number;
    kategori_adi: string;
  };
}

export interface Randevu {
  id: number;
  dukkan_id: number;
  musteri_id: number;
  personel_id: number;
  tarih: string;
  saat: string;
  durum: RandevuDurumu;
  notlar?: string;
  islemler: number[];
  customer_id?: string;
  created_at?: string;
  musteri?: {
    id: number;
    first_name: string;
    last_name?: string;
    phone?: string;
  };
  personel?: {
    id: number;
    ad_soyad: string;
  };
}

export type RandevuDurumu = 'beklemede' | 'onaylandi' | 'iptal' | 'tamamlandi' | 'iptal_edildi';

export interface Musteri {
  id: number;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  birthdate?: string | null;
  dukkan_id: number;
  created_at?: string;
}

export interface Personel {
  id: number;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  auth_id?: string;
  dukkan_id: number;
  prim_yuzdesi: number;
  maas: number;
  adres: string;
  birth_date?: string;
  avatar_url?: string;
  personel_no: string;
  calisma_sistemi: string;
}

export interface Profil {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  gender?: string | null;
  birthdate?: string | null;
  iban?: string | null;
  address?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  dukkan_id?: number | null;
  personel_id?: number | null;
  shopname?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Isletme {
  id: number;
  ad: string;
  kod: string;
  sahibi_id: string;
  telefon?: string;
  adres?: string;
  acik_adres?: string;
  logo_url?: string;
  active?: boolean;
  created_at?: string;
}
