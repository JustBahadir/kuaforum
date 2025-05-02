
export type RandevuDurumu = 'beklemede' | 'onaylandi' | 'iptal' | 'tamamlandi' | 'iptal_edildi';

export interface Randevu {
  id: number;
  musteri_id?: number;
  personel_id?: number;
  dukkan_id?: number;
  tarih: string;
  saat: string;
  durum: RandevuDurumu;
  notlar?: string;
  islemler: any[];
  customer_id?: string;
  created_at: string;
  musteri?: any;
  personel?: any;
}

export interface Isletme {
  id: number;
  ad: string;
  adres?: string;
  acik_adres?: string;
  telefon?: string;
  logo_url?: string;
  kod: string;
  sahibi_id: string;
  active?: boolean;
  created_at: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  iban?: string;
  address?: string;
  avatar_url?: string;
  birthdate?: string;
  gender?: string;
}

export interface PersonelIslemi {
  id: number;
  personel_id?: number;
  islem_id?: number;
  musteri_id?: number;
  randevu_id?: number;
  tutar: number;
  odenen: number;
  prim_yuzdesi: number;
  aciklama: string;
  puan: number;
  notlar?: string;
  photos?: string[];
  created_at?: string;
  musteri?: any;
  islem?: any;
  personel?: any;
}

export interface PersonelEgitim {
  personel_id: number;
  ortaokuldurumu: string;
  liseturu: string;
  lisedurumu: string;
  universitedurumu: string;
  universitebolum: string;
  meslekibrans: string;
}

export interface PersonelGecmis {
  personel_id: number;
  isyerleri: string;
  gorevpozisyon: string;
  yarismalar: string;
  cv: string;
  belgeler: string;
}

export interface Profil {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  role?: string;
  dukkan_id?: number;
}

export interface Personel {
  id: number;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  personel_no: string;
  maas: number;
  prim_yuzdesi: number;
  dukkan_id: number;
  calisma_sistemi: string;
  auth_id?: string;
  birth_date?: Date;
  iban?: string;
  avatar_url?: string;
}

export interface CalismaSaati {
  id?: number;
  dukkan_id?: number;
  gun: string;
  gun_sira: number;
  acilis: string | null;
  kapanis: string | null;
  kapali: boolean;
}

export interface Musteri {
  id: number;
  first_name: string;
  last_name?: string;
  phone?: string;
  birthdate?: string;
  dukkan_id?: number;
  created_at?: string;
}
