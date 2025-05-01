
// Common types for our application

// User roles
export type UserRole = 'admin' | 'staff' | 'customer';

// Randevu status types
export type RandevuDurumu = 'beklemede' | 'onaylandi' | 'tamamlandi' | 'iptal' | 'iptal_edildi';

// Calisma saati type
export interface CalismaSaati {
  id: number;
  gun: string;
  gun_sira: number;
  acilis: string | null;
  kapanis: string | null;
  kapali: boolean;
  dukkan_id: number;
  created_at?: string;
}

// Musteri type
export interface Musteri {
  id: number;
  first_name: string;
  last_name?: string;
  phone?: string;
  birthdate?: string;
  dukkan_id: number;
  created_at?: string;
}

// Profile type
export interface Profil {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  address?: string;
  birthdate?: string;
  avatar_url?: string;
  iban?: string;
  role?: UserRole;
  dukkan_id?: number;
  shopname?: string;
  created_at?: string;
  updated_at?: string;
}

// Islem type
export interface IslemDto {
  id: number;
  islem_adi: string;
  fiyat: number;
  maliyet: number;
  puan: number;
  kategori_id: number;
  sira: number;
  dukkan_id: number;
  created_at?: string;
}

// Personel islemi type
export interface PersonelIslemi {
  id: number;
  personel_id: number;
  islem_id: number;
  tutar: number;
  odenen: number;
  prim_yuzdesi: number;
  puan: number;
  aciklama: string;
  notlar?: string;
  musteri_id?: number;
  randevu_id?: number;
  photos?: string[];
  created_at: string;
  islem?: {
    islem_adi: string;
  };
  musteri?: {
    first_name: string;
    last_name?: string;
  };
}

// Isletme (dukkan) type
export interface Isletme {
  id: number;
  ad: string;
  kod: string;
  telefon?: string;
  adres?: string;
  acik_adres?: string;
  logo_url?: string;
  sahibi_id: string;
  active?: boolean;
  created_at?: string;
}

// Kategori type
export interface KategoriDto {
  id: number;
  kategori_adi: string;
  sira: number;
  dukkan_id: number;
  created_at?: string;
}

// Randevu type
export interface Randevu {
  id: number;
  musteri_id: number;
  personel_id: number;
  dukkan_id: number;
  tarih: string;
  saat: string;
  durum: RandevuDurumu;
  notlar?: string;
  islemler: any; // Can be json or array
  customer_id?: string;
  created_at?: string;
  musteri?: Musteri;
  personel?: any;
}
