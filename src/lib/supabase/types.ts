
// Personel tablosu için arayüz
export interface Personel {
  id: number;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  created_at?: string;
  personel_no: string;
  maas: number;
  gunluk_ucret?: number;
  haftalik_ucret?: number;
  prim_yuzdesi: number;
  calisma_sistemi: string;
  iban?: string;
  dukkan_id?: number;
  auth_id?: string;
  avatar_url?: string;
  baslama_tarihi?: string;
  aktif?: boolean;
}

// İşlemler tablosu için arayüz
export interface Islem {
  id: number;
  islem_adi: string;
  kategori_id?: number;
  fiyat: number;
  puan: number;
  sira?: number;
  created_at?: string;
}

// İşlem kategorileri tablosu için arayüz
export interface IslemKategori {
  id: number;
  kategori_adi: string;
  sira?: number;
  created_at?: string;
}

// Personel işlemi veri modeli
export interface PersonelIslemi {
  id: number;
  personel_id?: number;
  islem_id?: number;
  tutar: number;
  odenen: number;
  prim_yuzdesi: number;
  aciklama: string;
  musteri_id?: number;
  randevu_id?: number;
  created_at?: string;
  puan: number;
  islem?: Islem;
  personel?: Personel;
  musteri?: {
    id: number;
    first_name: string;
    last_name?: string;
  };
  notlar?: string;
  photos?: string[];
}

// Müşteri verileri
export interface Musteri {
  id: number;
  first_name: string;
  last_name?: string;
  phone?: string;
  dukkan_id?: number;
  birthdate?: string;
  created_at?: string;
}

// Randevu veri modeli
export interface Randevu {
  id: number;
  dukkan_id?: number;
  musteri_id?: number;
  personel_id?: number;
  customer_id?: string;
  tarih: string;
  saat: string;
  durum: string;
  notlar?: string;
  islemler: any;
  created_at?: string;
}

// Profil veri modeli
export interface Profil {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  birthdate?: string;
  role?: 'admin' | 'staff' | 'customer';
  dukkan_id?: number;
  iban?: string;
  created_at?: string;
}

// Dükkan veri modeli
export interface Dukkan {
  id: number;
  ad: string;
  adres?: string;
  acik_adres?: string;
  telefon?: string;
  kod: string;
  logo_url?: string;
  sahibi_id: string;
  active?: boolean;
  created_at?: string;
}

// Çalışma saatleri veri modeli
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

// Notifications interface
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
