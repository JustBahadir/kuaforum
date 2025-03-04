
// Type definitions
export type Islem = {
  id: number;
  created_at?: string;
  islem_adi: string;
  fiyat: number;
  puan: number;
  kategori_id?: number;
  sira?: number;
}

export type Kategori = {
  id: number;
  created_at?: string;
  kategori_adi: string;
  sira?: number;
}

export type Dukkan = {
  id: number;
  created_at?: string;
  ad: string;
  adres?: string;
  il_ilce?: string;
  telefon?: string;
  sahibi_id: string;
  logo_url?: string;
  active: boolean;
  kod?: string;
  email?: string;
  aciklama?: string;
  calisma_saatleri?: string;
}

export type Musteri = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at?: string;
  total_appointments?: number;
  total_services?: number;
}

export type Personel = {
  id: number;
  created_at?: string;
  personel_no?: string;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  maas: number;
  calisma_sistemi: "haftalik" | "aylik";
  prim_yuzdesi: number;
  auth_id?: string;
  dukkan_id?: number;
  dukkan?: Dukkan;
  avatar_url?: string;
  cinsiyet?: "erkek" | "kadın" | null;
}

export type PersonelIslemi = {
  id: number;
  created_at?: string;
  personel_id: number;
  islem_id: number;
  musteri_id?: string;
  aciklama: string;
  tutar: number;
  prim_yuzdesi: number;
  odenen: number;
  puan: number;
  islem?: Islem;
  musteri?: Musteri;
}

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at?: string;
  occupation?: string; 
  role?: string; // Role field to support different user types (customer, staff, admin)
  gender?: "erkek" | "kadın" | null; // Gender field with only male/female options or null
  birthdate?: string; // Birthdate field
  avatar_url?: string; // Avatar URL field
}

export type Notification = {
  id: number;
  created_at?: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  related_appointment_id?: number;
}

// Randevu durumları
export type RandevuDurumu = "beklemede" | "onaylandi" | "iptal_edildi" | "tamamlandi";

// Randevu tipi
export type Randevu = {
  id: number;
  created_at?: string;
  customer_id: string;
  personel_id?: number;
  tarih: string;
  saat: string;
  durum: RandevuDurumu;
  notlar?: string;
  admin_notes?: string;
  counter_proposal_date?: string;
  counter_proposal_time?: string;
  customer_accepted?: boolean;
  musteri?: Profile;
  personel?: Personel;
  islemler: number[];
  dukkan_id?: number;
}

export type CalismaSaati = {
  id?: number;
  gun: string;
  acilis: string;
  kapanis: string;
  kapali: boolean;
  dukkan_id?: number; // Add dukkan_id to support shop-specific working hours
}
