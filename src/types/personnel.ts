
export interface Personel {
  id: number;
  created_at?: string;
  maas: number;
  prim_yuzdesi: number;
  auth_id?: string | null;
  dukkan_id?: number | null;
  birth_date?: string | null;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  personel_no: string;
  calisma_sistemi: "haftalik" | "aylik";
  avatar_url?: string | null;
  iban?: string | null;
}

export interface PersonelIslemi {
  id: number;
  personel_id?: number | null;
  islem_id?: number | null;
  tutar: number;
  odenen: number;
  prim_yuzdesi: number;
  puan: number;
  photos?: string[] | null;
  aciklama: string;
  notlar?: string | null;
  musteri_id?: number | null;
  randevu_id?: number | null;
  created_at: string;
}
