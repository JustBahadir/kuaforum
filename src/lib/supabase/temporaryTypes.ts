
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
