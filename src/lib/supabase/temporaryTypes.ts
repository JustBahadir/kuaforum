
// Temporary types to support migration
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

export interface PersonelIslemi {
  id: number;
  personel_id: number;
  islem_id: number;
  tutar: number;
  odenen: number;
  prim_yuzdesi: number;
  puan: number;
  aciklama: string;
  musteri_id?: number;
  randevu_id?: number;
  notlar?: string;
  photos?: string[];
  created_at: string;
}

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

export interface StaffJoinRequest {
  id: string;
  shopCode: string;
  status: string;
  userId: string;
  createdAt: string;
  description?: string;
}

