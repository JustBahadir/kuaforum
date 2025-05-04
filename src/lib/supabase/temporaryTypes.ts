
/**
 * Geçici tip tanımlamaları - Build hatalarını düzeltmek için
 * Bunlar daha sonra Supabase şemasından gelen uygun tiplerle değiştirilecek
 */

// Rol ile birlikte Profil tipi
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

// Profil tipi
export interface Profil {
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

// Profil güncelleme verisi
export interface ProfileUpdateData {
  id?: string;
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

// Personel tipi
export interface Personel {
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

// İşletme tipi
export interface Isletme {
  id: string;
  ad: string;
  kod: string;
  sahibi_id: string;
  adres: string | null;
}

// İşlemler tipi
export interface PersonelIslemi {
  id: string;
  personel_id: string;
  islem_id: string;
  tutar: number;
  odenen: number;
  prim_yuzdesi: number;
  aciklama: string;
  created_at: string;
}

// Personel eğitim tipi
export interface PersonelEgitim {
  id: string;
  personel_id: string;
  egitim_adi: string;
  kurum: string;
  tarih: string;
  belge: string;
}

// Personel geçmiş tipi
export interface PersonelGecmis {
  id: string;
  personel_id: string;
  isyeri: string;
  pozisyon: string;
  baslangic: string;
  bitis: string;
  aciklama: string;
}

// Çalışma saatleri tipi
export interface CalismaSaati {
  id: string;
  dukkan_id: string;
  gun: string;
  acilis: string;
  kapanis: string;
  kapali: boolean;
  created_at: string;
  updated_at: string;
}

// Müşteri tipi
export interface Musteri {
  id: string;
  ad: string;
  soyad: string;
  telefon: string;
}

// İşlem tipi
export interface Islem {
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

// Başvuru tipi
export interface StaffJoinRequest {
  id: string;
  personel_id: string;
  dukkan_id: string;
  durum: string;
  created_at: string;
}

// Kullanıcı rol tipi
export type KullaniciRol = "isletme_sahibi" | "personel";
