
import { PostgrestError } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  phone?: string;
  gender?: "erkek" | "kadın" | null;
  birthdate?: string | null;
  avatar_url?: string;
  address?: string;
  iban?: string;
}

export interface Dukkan {
  id: number;
  ad: string;
  telefon?: string;
  adres?: string;
  acik_adres?: string;
  sahibi_id: string;
  kod: string;
  created_at: string;
  logo_url?: string;
  active: boolean;
}

export interface Kategori {
  id: number;
  kategori_adi: string;
  sira: number;
  created_at: string;
}

export interface Islem {
  id: number;
  islem_adi: string;
  fiyat: number;
  kategori_id?: number;
  sira: number;
  puan: number;
  created_at: string;
}

export interface Personel {
  id: number;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  personel_no: string;
  maas: number;
  calisma_sistemi: "haftalik" | "aylik";
  prim_yuzdesi: number;
  auth_id?: string;
  dukkan_id?: number;
  dukkan?: Dukkan;
  created_at: string;
  iban?: string;
}

export interface PersonelIslemi {
  id: number;
  personel_id: number;
  islem_id: number;
  tutar: number;
  odenen: number;
  prim_yuzdesi: number;
  puan: number;
  aciklama: string;
  created_at: string;
  islem?: Islem;
  personel?: Personel;
}

export interface Musteri {
  id: number;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  musteri_no: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  birthdate?: string | null;
  total_services?: number;
}

export type RandevuDurumu = "beklemede" | "onaylandi" | "iptal_edildi" | "tamamlandi";

export interface Randevu {
  id: number;
  musteri_id?: number;
  customer_id?: string;
  personel_id?: number;
  dukkan_id?: number;
  tarih: string;
  saat: string;
  durum: RandevuDurumu;
  notlar?: string;
  admin_notes?: string;
  created_at: string;
  islemler?: number[];
  customer_accepted?: boolean;
  counter_proposal_date?: string;
  counter_proposal_time?: string;
  musteri?: Profile;
  personel?: Personel;
}

export interface ResponseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
  original?: PostgrestError;
}

export interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  related_appointment_id?: number;
  type: string;
  created_at: string;
}

export interface CalismaSaati {
  id: number;
  gun: string;
  acilis?: string;
  kapanis?: string;
  kapali?: boolean;
}
