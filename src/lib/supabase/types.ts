
export interface KategoriDto {
  id: number;
  kategori_adi: string;
  sira: number;
  dukkan_id?: number;
  created_at?: string;
}

export interface Personel {
  id: number;
  ad_soyad: string;
  personel_no: string;
  eposta: string;
  telefon: string;
  adres: string;
  maas: number;
  prim_yuzdesi: number;
  calisma_sistemi: string;
  birth_date?: Date;
  dukkan_id?: number;
  auth_id?: string;
  iban?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface IslemDto {
  id: number;
  islem_adi: string;
  fiyat: number;
  maliyet?: number;
  puan: number;
  kategori_id?: number;
  sira?: number;
  created_at?: string;
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
  puan: number;
  aciklama: string;
  notlar?: string;
  photos?: string[];
  created_at: string;
  
  // Join fields
  personel?: Personel;
  islem?: IslemDto;
  musteri?: {
    id: number;
    first_name: string;
    last_name?: string;
    phone?: string;
  };
}

export interface Isletme {
  id: number;
  ad: string;
  kod: string;
  sahibi_id: string;
  adres?: string;
  acik_adres?: string;
  telefon?: string;
  logo_url?: string;
  active?: boolean;
  created_at?: string;
}

export type RandevuDurumu = 'beklemede' | 'onaylandi' | 'iptal' | 'tamamlandi' | 'iptal_edildi';

export interface Randevu {
  id: number;
  dukkan_id?: number;
  musteri_id?: number;
  personel_id?: number;
  tarih: string;
  saat: string;
  durum: RandevuDurumu;
  notlar?: string;
  islemler: number[];
  customer_id?: string;
  created_at?: string;
  
  // Joined data
  musteri?: {
    id: number;
    first_name: string;
    last_name?: string;
    phone?: string;
  };
  personel?: {
    id: number;
    ad_soyad: string;
  };
}
