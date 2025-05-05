
// These types are used during the migration process
// Once the application is fully migrated, these should be moved to the main types.ts file

export interface PersonelIslemi {
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
  created_at?: string;
  updated_at?: string;
}

export interface PersonelEgitim {
  id: string | number;
  personel_id: string | number;
  egitim_adi: string;
  kurum: string;
  baslangic: string;
  bitis?: string;
  aciklama?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PersonelGecmis {
  id: string | number;
  personel_id: string | number;
  isyeri_adi: string;
  pozisyon: string;
  baslangic: string;
  bitis?: string;
  aciklama?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileUpdateData {
  ad?: string;
  soyad?: string;
  telefon?: string;
  avatar_url?: string;
  website?: string;
  eposta?: string;
}

export interface StaffJoinRequest {
  id: string | number;
  personel_id: string | number;
  isletme_id: string;
  durum: "pending" | "approved" | "rejected";
  created_at?: string;
  updated_at?: string;
}
