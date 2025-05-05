
// Enum definitions
export type KullaniciRol = "isletme_sahibi" | "personel" | "musteri";
export type PersonelDurum = "aktif" | "izinli" | "cikti";
export type RandevuDurum = "bekliyor" | "onaylandi" | "iptal" | "tamamlandi" | "planlandi";
export type BasvuruDurum = "beklemede" | "onaylandi" | "reddedildi";

// Base entity with common properties for all entities
interface BaseEntity {
  created_at?: string;
  updated_at?: string;
}

// Main entities
export interface Kullanici extends BaseEntity {
  kimlik: string;
  ad: string;
  soyad: string;
  eposta: string;
  telefon?: string;
  rol: KullaniciRol;
  profil_tamamlandi: boolean;
  cinsiyet?: string;
  
  // Backward compatibility fields
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface Isletme extends BaseEntity {
  kimlik: string;
  id: string; // UUID format
  kod: string;
  ad: string;
  adres?: string;
  telefon?: string;
  website?: string;
  aciklama?: string;
  logo_url?: string;
  kapak_url?: string;
  sahip_kimlik: string;
  il?: string;
  ilce?: string;
  puan?: number;
  sosyal_medya?: any;
  detaylar?: any;
  durum?: string;
}

export interface Personel extends BaseEntity {
  kimlik: string;
  id: string | number; // ID can be string or number depending on context
  kullanici_kimlik?: string;
  isletme_id: string;
  ad_soyad: string;
  telefon?: string;
  eposta?: string;
  adres?: string;
  unvan?: string;
  gorev?: string;
  maas?: number;
  prim_yuzdesi?: number;
  durum: PersonelDurum;
  izin_baslangic?: string;
  izin_bitis?: string;
  dogum_tarihi?: string;
  ise_baslama_tarihi?: string;
  personel_no?: string;
  calisma_sistemi?: string;
}

export interface IslemKategorisi extends BaseEntity {
  id: string | number;
  kimlik: string;
  kategori_adi: string;
  baslik: string;
  aciklama?: string;
  isletme_id: string;
  isletme_kimlik: string;
  sira?: number;
}

export interface Hizmet extends BaseEntity {
  id: string | number;
  kimlik: string;
  islem_adi: string;
  hizmet_adi: string;
  aciklama?: string;
  fiyat: number;
  suresi?: number;
  sure_dakika?: number;
  kategori_id: string | number;
  kategori_kimlik?: string;
  isletme_id: string;
  isletme_kimlik: string;
  aktif: boolean;
  puan?: number;
  resim_url?: string;
  siralama?: number;
}

export interface Musteri extends BaseEntity {
  kimlik: string;
  id?: string | number;
  isletme_id: string;
  ad_soyad: string;
  telefon?: string;
  eposta?: string;
  dogum_tarihi?: string;
  cinsiyet?: string;
  notlar?: string;
  adres?: string;
  puan?: number;
  son_ziyaret?: string;
  kayit_tarihi?: string;
  
  // Backward compatibility fields for customer components
  ad?: string;
  soyad?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  birthdate?: string;
  address?: string;
  email?: string;
}

export interface Randevu extends BaseEntity {
  id: string | number;
  kimlik: string;
  isletme_id: string;
  musteri_id: string | number;
  musteri_kimlik: string;
  personel_id: string | number;
  personel_kimlik?: string;
  tarih: string;
  saat: string;
  bitis_saat?: string;
  durum: RandevuDurum;
  notlar?: string;
  islemler: any[];
  toplam_tutar?: number;
  customer_id?: string;
  
  // Backward compatibility fields
  hizmet_kimlik?: string; // For compatibility with customer dashboard
}

export interface PersonelBasvuru extends BaseEntity {
  id: string | number;
  kullanici_kimlik: string;
  isletme_id?: string;
  isletme_kodu?: string;
  durum: BasvuruDurum;
  tarih: string;
  onay_tarihi?: string;
  ret_tarihi?: string;
  ret_nedeni?: string;
}

export interface CalismaSaati extends BaseEntity {
  id: string | number;
  isletme_id: string;
  gun: string;
  acilis: string;
  kapanis: string;
  kapali: boolean;
}

export interface Profil extends BaseEntity {
  kimlik?: string;
  id?: string;
  ad?: string;
  soyad?: string;
  telefon?: string;
  eposta?: string;
  avatar_url?: string;
  website?: string;
  cinsiyet?: string;
  dogum_tarihi?: string;
  rol?: KullaniciRol;
  durum?: string;
  
  // Backward compatibility fields
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  role?: string;
  birthdate?: string;
}

export interface PersonelIslemi extends BaseEntity {
  id: string | number;
  personel_id: string | number;
  islem_id: string | number;
  musteri_id: string | number;
  randevu_id?: string | number;
  tutar: number;
  odenen: number;
  prim_yuzdesi: number;
  puan?: number;
  aciklama?: string;
  tarih?: string;
}
