
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
  kategori_id: number;
  fiyat: number;
  puan: number;
  sira: number;
  created_at: string;
  dukkan_id: number;
  maliyet?: number;
}

export type RandevuDurumu = 'beklemede' | 'onaylandi' | 'iptal' | 'tamamlandi' | 'iptal_edildi';

export interface Randevu {
  id: number;
  dukkan_id: number;
  musteri_id?: number | null;
  musteri?: {
    id: number;
    first_name: string;
    last_name?: string | null;
    phone?: string | null;
  } | null;
  personel_id: number;
  personel?: {
    id: number;
    ad_soyad: string;
  } | null;
  tarih: string;
  saat: string;
  durum: RandevuDurumu;
  notlar?: string;
  created_at: string;
  islemler: any[];
  customer_id?: string;
}

export interface Musteri {
  id: number;
  dukkan_id: number;
  first_name: string;
  last_name?: string;
  phone?: string;
  birthdate?: string;
  created_at: string;
}

export interface Personel {
  id: number;
  dukkan_id: number;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  personel_no: string;
  maas: number;
  prim_yuzdesi: number;
  calisma_sistemi: string;
  created_at: string;
  birth_date?: string | null;
  auth_id?: string | null;
  avatar_url?: string | null;
  iban?: string | null;
}

export interface PersonelIslemi {
  id: number;
  personel_id: number;
  islem_id: number;
  musteri_id?: number;
  randevu_id?: number;
  tutar: number;
  odenen: number;
  prim_yuzdesi: number;
  puan: number;
  aciklama: string;
  notlar?: string;
  created_at: string;
  photos?: string[];
  dukkan_id: number;
  personel?: Personel;
  musteri?: Musteri;
  islem?: Islem;
}

export interface Profil {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthdate?: string;
  avatar_url?: string;
  shopname?: string;
  address?: string;
  iban?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  related_appointment_id?: number;
}

export interface Dukkan {
  id: number;
  ad: string;
  kod: string;
  adres?: string;
  acik_adres?: string;
  telefon?: string;
  logo_url?: string;
  active?: boolean;
  sahibi_id: string;
  created_at: string;
}

export interface CalismaGunu {
  id: number;
  dukkan_id?: number;
  gun: string;
  gun_sira: number;
  acilis?: string;
  kapanis?: string;
  kapali?: boolean;
  created_at?: string;
}
