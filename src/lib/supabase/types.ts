
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
