
// Temporary types for compatibility during migration

export interface PersonelEgitim {
  personel_id: number;
  ortaokuldurumu: string;
  lisedurumu: string;
  liseturu: string;
  universitedurumu: string;
  universitebolum: string;
  meslekibrans: string;
  created_at?: string;
  updated_at?: string;
}

export interface PersonelGecmis {
  personel_id: number;
  isyerleri: string;
  gorevpozisyon: string;
  belgeler: string;
  yarismalar: string;
  cv: string;
  created_at?: string;
  updated_at?: string;
}

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

export interface StaffJoinRequest {
  id: string | number;
  personel_id: string | number;
  isletme_id: string;
  durum: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface PersonelIslemi {
  id: string | number;
  personel_id: string | number;
  islem_id: string | number;
  musteri_id: string | number;
  musteri?: any;
  islem?: any;
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

// Definition for CustomerOperation to fix type conflict
export type CustomerOperation = {
  id: number;
  operation_name: string;
  date: string;
  amount: number;
  staff_name: string;
  description?: string;
  service_name?: string;
  personnel_name?: string;
  created_at?: string;
};
