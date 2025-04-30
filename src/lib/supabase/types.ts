
export interface KategoriDto {
  id: number;
  kategori_adi: string;
  sira?: number;
  dukkan_id: number;
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
  dukkan_id: number;
  created_at?: string;
}

export interface PersonelIslemi {
  id: number;
  personel_id?: number;
  islem_id?: number;
  tutar: number;
  odenen: number;
  prim_yuzdesi?: number;
  puan: number;
  aciklama: string;
  musteri_id?: number;
  randevu_id?: number;
  notlar?: string;
  photos?: string[];
  created_at: string;
  dukkan_id: number;
}

export interface Musteri {
  id: number;
  first_name: string;
  last_name?: string;
  phone?: string;
  birthdate?: string;
  dukkan_id: number;
  created_at: string;
}
