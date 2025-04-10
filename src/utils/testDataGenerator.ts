import { Personel, Islem, IslemKategori } from "@/lib/supabase/types";

const generatePersonel = (count: number): Personel[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    ad_soyad: `Personel ${i + 1}`,
    telefon: "555-123-4567",
    eposta: `personel${i + 1}@example.com`,
    adres: "123 Main St",
    personel_no: `P${i + 1}`,
    maas: 5000 + i * 100,
    prim_yuzdesi: 5 + i,
    calisma_sistemi: "aylik_maas",
  }));
};

const generateIslemler = (count: number): Islem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    islem_adi: `Islem ${i + 1}`,
    kategori_id: 1,
    fiyat: 50 + i * 10,
    puan: 10 + i,
  }));
};

// Update categories generation to use IslemKategori
const generateCategories = (count: number): IslemKategori[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    kategori_adi: `Kategori ${i + 1}`,
    sira: i,
    created_at: new Date().toISOString()
  }));
};

export { generatePersonel, generateIslemler, generateCategories };
