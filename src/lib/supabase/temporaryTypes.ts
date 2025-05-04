
/**
 * Temporary type definitions to fix build errors
 * These will be replaced with proper types from Supabase schema
 */

// Profile type with role
export interface ProfileWithRole {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  shopname?: string;
  role?: string;
  birthdate?: string;
  avatar_url?: string;
  address?: string;
  iban?: string;
}

// Personnel type
export interface Personnel {
  id: string;
  auth_id: string;
  dukkan_id: string | null;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  maas: number;
  prim_yuzdesi: number;
  baslama_tarihi: string;
}

// Business type
export interface Business {
  id: string;
  ad: string;
  kod: string;
  sahibi_id: string;
  adres: string | null;
}

// Working hours type
export interface CalismaSaati {
  id: string;
  dukkan_id: string;
  gun: string;
  acilis: string;
  kapanis: string;
  kapali: boolean;
}

// Customer type
export interface Customer {
  id: string;
  ad: string;
  soyad: string;
  telefon: string;
}

// Operation type
export interface Operation {
  id: string;
  personel_id: string;
  personel: any;
  musteri_id: string;
  tutar: number;
  odenen: number;
  aciklama: string;
  created_at: string;
  odeme_yontemi: string;
  notlar: string;
}

// Request type
export interface JoinRequest {
  id: string;
  personel_id: string;
  dukkan_id: string;
  durum: string;
  created_at: string;
}

// Replace the Customer role type with the one needed
export type KullaniciRol = "isletme_sahibi" | "personel";
