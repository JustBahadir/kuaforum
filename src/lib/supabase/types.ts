
export interface KategoriDto {
  id: number;
  kategori_adi: string;
  sira?: number;
  dukkan_id: number;
  created_at?: string;
}

export interface IslemDto {
  id: number;
  islem_adi: string;
  fiyat: number;
  maliyet?: number;
  puan: number;
  kategori_id?: number;
  sira?: number;
  dukkan_id: number;
  created_at?: string;
}

export interface PersonelIslemi {
  id: number;
  personel_id?: number;
  islem_id?: number;
  tutar: number;
  odenen: number;
  prim_yuzdesi?: number;
  puan: number;
  aciklama: string;
  musteri_id?: number;
  randevu_id?: number;
  notlar?: string;
  photos?: string[];
  created_at: string;
  dukkan_id: number;
  personel?: any;  // Add this to fix personnel index error
  musteri?: any;   // Add this to fix personnel index error
  islem?: any;     // Add this to fix personnel index error
}

export interface Musteri {
  id: number;
  first_name: string;
  last_name?: string;
  phone?: string;
  birthdate?: string;
  dukkan_id: number;
  created_at: string;
}

// Add missing type definitions
export interface Randevu {
  id: number;
  dukkan_id: number;
  musteri_id?: number;
  personel_id?: number;
  tarih: string;
  saat: string;
  durum: RandevuDurumu;
  notlar?: string;
  islemler: any;
  created_at: string;
  customer_id?: string;
  musteri?: Musteri;
  personel?: Personel;
}

export type RandevuDurumu = 'beklemede' | 'onaylandi' | 'tamamlandi' | 'iptal_edildi' | 'iptal';

export interface CalismaSaati {
  id: number;
  dukkan_id: number;
  gun: string;
  gun_sira: number;
  acilis?: string;
  kapanis?: string;
  kapali?: boolean;
  created_at?: string;
}

export interface Dukkan {
  id: number;
  ad: string;
  telefon?: string;
  adres?: string;
  acik_adres?: string;
  logo_url?: string;
  sahibi_id: string;
  kod: string;
  active?: boolean;
  created_at: string;
}

export interface Personel {
  id: number;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  birth_date?: string;
  personel_no: string;
  dukkan_id?: number;
  calisma_sistemi: string;
  maas: number;
  prim_yuzdesi: number;
  auth_id?: string;
  avatar_url?: string;
  iban?: string;
  created_at: string;
}

export interface Profil {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  birthdate?: string;
  avatar_url?: string;
  iban?: string;
  address?: string;
  role?: string;
  email?: string;
  dukkan_id?: number;
  shopname?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IslemKategori {
  id: number;
  kategori_adi: string;
  sira?: number;
  created_at?: string;
  dukkan_id: number; // Added since it's needed
}
