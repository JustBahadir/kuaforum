
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
