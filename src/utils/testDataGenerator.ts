
import { supabase } from "@/lib/supabase/client";
import { KategoriDto, IslemDto, PersonelIslemi } from "@/lib/supabase/types";

interface Personel {
  id: number;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  personel_no: string;
  maas: number;
  prim_yuzdesi: number;
  calisma_sistemi: string;
  created_at: string;
  dukkan_id: number;
}

interface Islem {
  id: number;
  islem_adi: string;
  kategori_id: number;
  fiyat: number;
  puan: number;
  sira: number;
  created_at: string;
  dukkan_id: number;
}

interface IslemKategori {
  id: number;
  kategori_adi: string;
  sira: number;
  created_at: string;
  dukkan_id: number;
}

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
    created_at: new Date().toISOString(),
    dukkan_id: 1 // Default dukkan_id
  }));
};

const generateIslemler = (count: number): Islem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    islem_adi: `Islem ${i + 1}`,
    kategori_id: 1,
    fiyat: 50 + i * 10,
    puan: 10 + i,
    sira: i,
    created_at: new Date().toISOString(),
    dukkan_id: 1 // Default dukkan_id
  }));
};

const generateCategories = (count: number): IslemKategori[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    kategori_adi: `Kategori ${i + 1}`,
    sira: i,
    created_at: new Date().toISOString(),
    dukkan_id: 1 // Default dukkan_id
  }));
};

// Add the generateTestData function
export const generateTestData = async () => {
  try {
    console.log("Generating test data...");
    // This would typically insert data using Supabase
    // For now, we'll just return dummy data
    const categories = generateCategories(5);
    const islemler = generateIslemler(10);
    const personel = generatePersonel(3);
    
    console.log("Test data generated", { categories, islemler, personel });
    return { categories, islemler, personel };
  } catch (error) {
    console.error("Error generating test data:", error);
    throw error;
  }
};

export { generatePersonel, generateIslemler, generateCategories };
