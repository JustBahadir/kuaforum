
export type KullaniciRol = "isletme_sahibi" | "personel";
export type PersonelDurum = "atanmadi" | "beklemede" | "onaylandi";
export type RandevuDurum = "planlandi" | "iptal" | "tamamlandi";
export type BasvuruDurum = "beklemede" | "kabul" | "reddedildi";

export interface Kullanici {
  kimlik: string;
  ad: string;
  soyad: string;
  eposta: string;
  telefon: string | null;
  rol: KullaniciRol;
  profil_tamamlandi: boolean;
  created_at: string;
  updated_at: string;
}

export interface Isletme {
  kimlik: string;
  isletme_adi: string;
  isletme_kodu: string;
  adres: string | null;
  telefon: string | null;
  sahip_kimlik: string;
  aciklama: string | null;
  created_at: string;
  updated_at: string;
}

export interface Personel {
  kimlik: string;
  kullanici_kimlik: string;
  isletme_kimlik: string | null;
  okul_gecmisi: string | null;
  deneyim: string | null;
  uzmanlik_alani: string | null;
  durum: PersonelDurum;
  created_at: string;
  updated_at: string;
}

export interface IslemKategorisi {
  kimlik: string;
  isletme_kimlik: string;
  baslik: string;
  aciklama: string | null;
  siralama: number;
  created_at: string;
  updated_at: string;
}

export interface Hizmet {
  kimlik: string;
  kategori_kimlik: string;
  isletme_kimlik: string;
  hizmet_adi: string;
  sure_dakika: number;
  fiyat: number;
  siralama: number;
  created_at: string;
  updated_at: string;
}

export interface Musteri {
  kimlik: string;
  isletme_kimlik: string;
  ad: string;
  soyad: string | null;
  telefon: string | null;
  dogum_tarihi: string | null;
  created_at: string;
  updated_at: string;
}

export interface Randevu {
  kimlik: string;
  musteri_kimlik: string | null;
  isletme_kimlik: string;
  personel_kimlik: string | null;
  kategori_kimlik: string | null;
  hizmet_kimlik: string | null;
  tarih: string; // YYYY-MM-DD
  saat: string; // HH:MM
  notlar: string | null;
  durum: RandevuDurum;
  created_at: string;
  updated_at: string;
}

export interface PersonelBasvuru {
  kimlik: string;
  kullanici_kimlik: string;
  isletme_kodu: string;
  durum: BasvuruDurum;
  aciklama: string | null;
  tarih: string;
}

// Adding RandevuDurumu alias for compatibility with existing code
export type RandevuDurumu = RandevuDurum;

// Adding CalismaSaati type for compatibility
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

// Tam adları göstermek için yardımcı fonksiyon
export const durum = {
  randevu: {
    planlandi: "Planlandı",
    iptal: "İptal",
    tamamlandi: "Tamamlandı"
  },
  personel: {
    atanmadi: "Atanmadı",
    beklemede: "Beklemede",
    onaylandi: "Onaylandı"
  },
  basvuru: {
    beklemede: "Beklemede",
    kabul: "Kabul",
    reddedildi: "Reddedildi"
  }
};

// For Supabase client
export interface Database {}
