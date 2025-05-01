
export type RandevuDurumu = 'beklemede' | 'onaylandi' | 'tamamlandi' | 'iptal' | 'iptal_edildi';

export interface CalismaSaati {
  id?: number;
  gun: string;
  gun_sira: number;
  acilis?: string;
  kapanis?: string;
  kapali?: boolean;
  dukkan_id?: number;
}

export interface Randevu {
  id: number;
  musteri_id?: number;
  personel_id?: number;
  dukkan_id?: number;
  customer_id?: string;
  tarih: string;
  saat: string;
  durum: RandevuDurumu;
  notlar?: string;
  islemler: any;
  created_at?: string;
  musteri?: any;
  personel?: any;
}

export interface PersonelIslemi {
  id: number;
  personel_id?: number;
  islem_id?: number;
  musteri_id?: number;
  tutar: number;
  odenen: number;
  prim_yuzdesi: number;
  puan: number;
  aciklama: string;
  notlar?: string;
  randevu_id?: number;
  created_at: string;
  personel?: any;
}

export interface Profil {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  address?: string;
  birthdate?: string;
  iban?: string;
  role?: string;
  dukkan_id?: number;
}
