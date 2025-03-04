// Update imports
import { supabase } from "@/lib/supabase/client";
import { islemServisi, kategoriServisi, musteriServisi, personelServisi, personelIslemleriServisi, dukkanServisi } from "@/lib/supabase";
import { faker } from '@faker-js/faker';
import { toast } from "sonner";

// Set the faker locale to Turkish
faker.setLocale('tr');

const generateDukkan = async () => {
  try {
    // Check if a store already exists
    const { data: existingDukkanlar, error: existingDukkanlarError } = await supabase
      .from('dukkanlar')
      .select('*');

    if (existingDukkanlarError) {
      throw new Error(existingDukkanlarError.message);
    }

    if (existingDukkanlar && existingDukkanlar.length > 0) {
      console.log("Zaten bir dükkan var, yeni dükkan oluşturulmayacak.");
      return;
    }

    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Kullanıcı oturumu bulunamadı.");
    }

    // Create a new store
    const { data: newDukkan, error: newDukkanError } = await supabase
      .from('dukkanlar')
      .insert([
        {
          ad: faker.company.name(),
          telefon: faker.phone.number(),
          adres: faker.address.streetAddress(),
          acik_adres: faker.address.streetAddress(true),
          sahibi_id: user.id,
          kod: faker.random.alpha({ count: 6, casing: 'upper' }),
          logo_url: faker.image.business(640, 480, true)
        }
      ])
      .select();

    if (newDukkanError) {
      throw new Error(newDukkanError.message);
    }

    console.log("Dükkan başarıyla oluşturuldu:", newDukkan);
  } catch (error) {
    console.error("Dükkan oluşturulurken hata:", error);
    throw error;
  }
};

const generateKategoriler = async (count = 5) => {
  try {
    // Check if categories already exist
    const { data: existingKategoriler, error: existingKategorilerError } = await supabase
      .from('islem_kategorileri')
      .select('*');

    if (existingKategorilerError) {
      throw new Error(existingKategorilerError.message);
    }

    if (existingKategoriler && existingKategoriler.length > 0) {
      console.log("Zaten kategoriler var, yeni kategori oluşturulmayacak.");
      return;
    }

    // Generate random categories
    for (let i = 0; i < count; i++) {
      await kategoriServisi.ekle({
        kategori_adi: faker.commerce.department(),
        sira: i
      });
    }

    console.log(`${count} kategori başarıyla oluşturuldu`);
  } catch (error) {
    console.error("Kategoriler oluşturulurken hata:", error);
    throw error;
  }
};

const generateIslemler = async (count = 50) => {
  try {
    const personelList = await personelServisi.hepsiniGetir();
    if (!personelList.length) {
      throw new Error("Personel bulunamadı");
    }

    const islemList = await islemServisi.hepsiniGetir();
    if (!islemList.length) {
      throw new Error("İşlem bulunamadı");
    }

    // Generate random islemler
    for (let i = 0; i < count; i++) {
      const randomPersonel = personelList[Math.floor(Math.random() * personelList.length)];
      const randomIslem = islemList[Math.floor(Math.random() * islemList.length)];
      
      const randomDate = faker.date.between({
        from: '2023-01-01',
        to: new Date()
      });

      const tutar = randomIslem.fiyat;
      const prim_yuzdesi = randomPersonel.prim_yuzdesi;
      const odenen = Math.round(tutar * (prim_yuzdesi / 100));

      await personelIslemleriServisi.ekle({
        personel_id: randomPersonel.id,
        islem_id: randomIslem.id,
        tutar: tutar,
        odenen: odenen,
        prim_yuzdesi: prim_yuzdesi,
        puan: randomIslem.puan,
        aciklama: randomIslem.islem_adi
      });
    }

    console.log(`${count} işlem başarıyla oluşturuldu`);
    return true;
  } catch (error) {
    console.error("İşlemler oluşturulurken hata:", error);
    throw error;
  }
};

const generatePersonel = async (count = 10) => {
  try {
    // Check if personnel already exists
    const { data: existingPersonel, error: existingPersonelError } = await supabase
      .from('personel')
      .select('*');

    if (existingPersonelError) {
      throw new Error(existingPersonelError.message);
    }

    if (existingPersonel && existingPersonel.length > 0) {
      console.log("Zaten personel var, yeni personel oluşturulmayacak.");
      return;
    }

    // Get the first store
    const { data: dukkanlar, error: dukkanlarError } = await supabase
      .from('dukkanlar')
      .select('*')
      .limit(1);

    if (dukkanlarError) {
      throw new Error(dukkanlarError.message);
    }

    if (!dukkanlar || dukkanlar.length === 0) {
      throw new Error("Dükkan bulunamadı, önce dükkan oluşturun.");
    }

    const dukkan = dukkanlar[0];

    // Generate random personnel
    for (let i = 0; i < count; i++) {
      await personelServisi.ekle({
        ad_soyad: faker.name.fullName(),
        telefon: faker.phone.number(),
        eposta: faker.internet.email(),
        adres: faker.address.streetAddress(),
        personel_no: faker.random.alphaNumeric(8),
        maas: faker.datatype.number({ min: 5000, max: 20000 }),
        calisma_sistemi: faker.helpers.arrayElement(['haftalik', 'aylik']),
        prim_yuzdesi: faker.datatype.number({ min: 1, max: 10 }),
        dukkan_id: dukkan.id
      });
    }

    console.log(`${count} personel başarıyla oluşturuldu`);
  } catch (error) {
    console.error("Personel oluşturulurken hata:", error);
    throw error;
  }
};

const generateMusteri = async (count = 20) => {
  try {
    // Check if customers already exist
    const { data: existingMusteriler, error: existingMusterilerError } = await supabase
      .from('musteriler')
      .select('*');

    if (existingMusterilerError) {
      throw new Error(existingMusterilerError.message);
    }

    if (existingMusteriler && existingMusteriler.length > 0) {
      console.log("Zaten müşteriler var, yeni müşteri oluşturulmayacak.");
      return;
    }

    // Generate random customers
    for (let i = 0; i < count; i++) {
      await musteriServisi.ekle({
        ad_soyad: faker.name.fullName(),
        telefon: faker.phone.number(),
        eposta: faker.internet.email(),
        adres: faker.address.streetAddress(),
        musteri_no: faker.random.alphaNumeric(8)
      });
    }

    console.log(`${count} müşteri başarıyla oluşturuldu`);
  } catch (error) {
    console.error("Müşteriler oluşturulurken hata:", error);
    throw error;
  }
};

const generateIslemForEachPersonel = async () => {
  try {
    const personelList = await personelServisi.hepsiniGetir();
    if (!personelList.length) {
      throw new Error("Personel bulunamadı");
    }

    const islemList = await islemServisi.hepsiniGetir();
    if (!islemList.length) {
      throw new Error("İşlem bulunamadı");
    }

    for (const personel of personelList) {
      const randomIslem = islemList[Math.floor(Math.random() * islemList.length)];
      
      const tutar = randomIslem.fiyat;
      const prim_yuzdesi = personel.prim_yuzdesi;
      const odenen = Math.round(tutar * (prim_yuzdesi / 100));

      await personelIslemleriServisi.ekle({
        personel_id: personel.id,
        islem_id: randomIslem.id,
        tutar: tutar,
        odenen: odenen,
        prim_yuzdesi: prim_yuzdesi,
        puan: randomIslem.puan,
        aciklama: randomIslem.islem_adi
      });
    }

    console.log(`Her personel için bir işlem başarıyla oluşturuldu`);
    return true;
  } catch (error) {
    console.error("İşlemler oluşturulurken hata:", error);
    throw error;
  }
};

const generateAll = async () => {
  try {
    await generateDukkan();
    await generateKategoriler();
    await generatePersonel();
    await generateMusteri();
    await generateIslemForEachPersonel();
    toast.success("Test verileri başarıyla oluşturuldu");
  } catch (error) {
    console.error("Test verileri oluşturulurken hata:", error);
    toast.error("Test verileri oluşturulurken bir hata oluştu");
  }
};

// Export all functions including generateAll as generateTestData for backward compatibility
export { 
  generateAll as generateTestData, 
  generateAll, 
  generateDukkan, 
  generateKategoriler, 
  generatePersonel, 
  generateMusteri, 
  generateIslemler, 
  generateIslemForEachPersonel 
};
