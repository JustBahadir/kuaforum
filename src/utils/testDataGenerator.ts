
import { supabase } from "@/lib/supabase/client";
import { faker } from '@faker-js/faker';
import { 
  Dukkan, 
  Islem, 
  Kategori, 
  Musteri, 
  Personel 
} from "@/lib/supabase/types";
import { toast } from "sonner";

// Set the faker locale 
// Using a workaround for the Faker v9 API
const setFakerLocale = () => {
  // @ts-ignore - Faker has changed its API, but we need to make it work
  if (typeof faker.locale === 'function') {
    // @ts-ignore
    faker.locale('tr');
  }
}

setFakerLocale();

const generateDukkan = async () => {
  try {
    const dukkan: Partial<Dukkan> = {
      ad: faker.company.name(),
      telefon: faker.phone.number(),
      adres: faker.location.streetAddress({ useFullAddress: true }),
      kod: faker.string.alphanumeric(6).toUpperCase(),
      logo_url: faker.image.url({ width: 200, height: 200 }),
    };

    const { data, error } = await supabase
      .from('dukkanlar')
      .insert([dukkan])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating shop:", error);
    throw error;
  }
};

const generateKategoriler = async () => {
  try {
    const categories = [
      "Saç Bakım",
      "Cilt Bakım",
      "Tırnak Bakım",
      "Makyaj",
      "Masaj",
    ];

    const kategoriler = categories.map((kategori_adi, index) => ({
      kategori_adi,
      sira: index,
    }));

    const { data, error } = await supabase
      .from('islem_kategorileri')
      .insert(kategoriler)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating categories:", error);
    throw error;
  }
};

const generateIslemler = async (kategoriler: Kategori[]) => {
  try {
    const sacBakimKategori = kategoriler.find(k => k.kategori_adi === "Saç Bakım");
    const ciltBakimKategori = kategoriler.find(k => k.kategori_adi === "Cilt Bakım");
    const tirnakBakimKategori = kategoriler.find(k => k.kategori_adi === "Tırnak Bakım");
    const makyajKategori = kategoriler.find(k => k.kategori_adi === "Makyaj");
    const masajKategori = kategoriler.find(k => k.kategori_adi === "Masaj");

    const sacIslemleri = [
      { islem_adi: "Saç Kesimi", fiyat: 150, puan: 10, kategori_id: sacBakimKategori?.id, sira: 0 },
      { islem_adi: "Saç Boyama", fiyat: 250, puan: 15, kategori_id: sacBakimKategori?.id, sira: 1 },
      { islem_adi: "Fön", fiyat: 100, puan: 5, kategori_id: sacBakimKategori?.id, sira: 2 },
      { islem_adi: "Keratin Bakımı", fiyat: 350, puan: 20, kategori_id: sacBakimKategori?.id, sira: 3 },
    ];

    const ciltIslemleri = [
      { islem_adi: "Cilt Temizliği", fiyat: 200, puan: 12, kategori_id: ciltBakimKategori?.id, sira: 0 },
      { islem_adi: "Yüz Maskesi", fiyat: 150, puan: 8, kategori_id: ciltBakimKategori?.id, sira: 1 },
      { islem_adi: "Anti-Aging Bakım", fiyat: 350, puan: 18, kategori_id: ciltBakimKategori?.id, sira: 2 },
    ];

    const tirnakIslemleri = [
      { islem_adi: "Manikür", fiyat: 120, puan: 7, kategori_id: tirnakBakimKategori?.id, sira: 0 },
      { islem_adi: "Pedikür", fiyat: 150, puan: 8, kategori_id: tirnakBakimKategori?.id, sira: 1 },
      { islem_adi: "Protez Tırnak", fiyat: 250, puan: 12, kategori_id: tirnakBakimKategori?.id, sira: 2 },
    ];

    const makyajIslemleri = [
      { islem_adi: "Gündüz Makyajı", fiyat: 180, puan: 10, kategori_id: makyajKategori?.id, sira: 0 },
      { islem_adi: "Gece Makyajı", fiyat: 250, puan: 15, kategori_id: makyajKategori?.id, sira: 1 },
      { islem_adi: "Gelin Makyajı", fiyat: 500, puan: 25, kategori_id: makyajKategori?.id, sira: 2 },
    ];

    const masajIslemleri = [
      { islem_adi: "Klasik Masaj", fiyat: 250, puan: 15, kategori_id: masajKategori?.id, sira: 0 },
      { islem_adi: "Aromaterapi", fiyat: 300, puan: 18, kategori_id: masajKategori?.id, sira: 1 },
      { islem_adi: "Sıcak Taş Masajı", fiyat: 350, puan: 20, kategori_id: masajKategori?.id, sira: 2 },
    ];

    const allIslemler = [
      ...sacIslemleri,
      ...ciltIslemleri,
      ...tirnakIslemleri,
      ...makyajIslemleri,
      ...masajIslemleri,
    ];

    const { data, error } = await supabase
      .from('islemler')
      .insert(allIslemler)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating services:", error);
    throw error;
  }
};

const generatePersonel = async (dukkanId: number) => {
  try {
    const personeller: Partial<Personel>[] = [];

    for (let i = 0; i < 5; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      personeller.push({
        ad_soyad: `${firstName} ${lastName}`,
        telefon: faker.phone.number(),
        eposta: faker.internet.email({ firstName, lastName }),
        adres: faker.location.streetAddress({ useFullAddress: true }),
        personel_no: `P${faker.string.numeric(4)}`,
        maas: faker.number.int({ min: 10000, max: 20000 }),
        calisma_sistemi: faker.helpers.arrayElement(["haftalik", "aylik"]) as "haftalik" | "aylik",
        prim_yuzdesi: faker.number.int({ min: 5, max: 15 }),
        dukkan_id: dukkanId,
      });
    }

    const { data, error } = await supabase
      .from('personel')
      .insert(personeller)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating personnel:", error);
    throw error;
  }
};

const generateMusteriler = async () => {
  try {
    const musteriler: Partial<Musteri>[] = [];

    for (let i = 0; i < 10; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      musteriler.push({
        ad_soyad: `${firstName} ${lastName}`,
        telefon: faker.phone.number(),
        eposta: faker.internet.email({ firstName, lastName }),
        adres: faker.location.streetAddress({ useFullAddress: true }),
        musteri_no: `M${faker.string.numeric(4)}`,
      });
    }

    const { data, error } = await supabase
      .from('musteriler')
      .insert(musteriler)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating customers:", error);
    throw error;
  }
};

const generateRandomData = async () => {
  try {
    const dukkan = await generateDukkan();
    const kategoriler = await generateKategoriler();
    const islemler = await generateIslemler(kategoriler);
    const personeller = await generatePersonel(dukkan.id);
    const musteriler = await generateMusteriler();

    return {
      dukkan,
      kategoriler,
      islemler,
      personeller,
      musteriler,
    };
  } catch (error) {
    console.error("Error generating test data:", error);
    throw error;
  }
};

// Main export function
export const generateTestData = async () => {
  try {
    toast.loading("Test verileri oluşturuluyor...");
    await generateRandomData();
    toast.success("Test verileri başarıyla oluşturuldu");
  } catch (error) {
    console.error("Error:", error);
    toast.error("Test verileri oluşturulurken hata oluştu");
  }
};
