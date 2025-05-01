
export interface CalismaSaati {
  id: number | string;
  dukkan_id: number;
  gun: string;
  gun_sira: number;
  acilis: string | null;
  kapanis: string | null;
  kapali: boolean;
}

export interface KategoriDto {
  id: number;
  kategori_adi: string;
  dukkan_id: number;
  sira: number;
  created_at?: string;
}

export interface IslemDto {
  id: number;
  islem_adi: string;
  fiyat: number;
  maliyet?: number;
  puan: number;
  kategori_id: number;
  dukkan_id: number;
  sira: number;
  created_at?: string;
  kategori?: {
    id: number;
    kategori_adi: string;
  };
}

export interface Randevu {
  id: number;
  dukkan_id: number;
  musteri_id: number;
  personel_id: number;
  tarih: string;
  saat: string;
  durum: RandevuDurumu;
  notlar?: string;
  islemler: number[];
  customer_id?: string;
  created_at?: string;
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

export type RandevuDurumu = 'beklemede' | 'onaylandi' | 'iptal' | 'tamamlandi' | 'iptal_edildi';
