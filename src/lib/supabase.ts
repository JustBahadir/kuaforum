
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://abcdefghijk.supabase.co';    // Bu URL'yi kendi Supabase URL'niz ile değiştirin
const supabaseKey = 'your-anon-key';                      // Bu key'i kendi Supabase anon/public key'iniz ile değiştirin

export const supabase = createClient(supabaseUrl, supabaseKey);

// Müşteri tipi tanımı
export type Musteri = {
  id: number;
  olusturulma_tarihi?: string;
  ad_soyad: string;
  telefon: string;
  eposta: string;
  adres: string;
  musteri_no: string;
}

// Müşteri işlemleri için yardımcı fonksiyonlar
export const musteriServisi = {
  // Tüm müşterileri getir
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Müşteri ara
  async ara(aramaMetni: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${aramaMetni}%,phone.ilike.%${aramaMetni}%,email.ilike.%${aramaMetni}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Yeni müşteri ekle
  async ekle(musteri: Omit<Musteri, 'id' | 'olusturulma_tarihi'>) {
    const musteriVerisi = {
      name: musteri.ad_soyad,
      phone: musteri.telefon,
      email: musteri.eposta,
      address: musteri.adres,
      customer_number: musteri.musteri_no
    };

    const { data, error } = await supabase
      .from('customers')
      .insert([musteriVerisi])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Müşteri güncelle
  async guncelle(id: number, musteri: Partial<Musteri>) {
    const guncelVeriler: any = {};
    if (musteri.ad_soyad) guncelVeriler.name = musteri.ad_soyad;
    if (musteri.telefon) guncelVeriler.phone = musteri.telefon;
    if (musteri.eposta) guncelVeriler.email = musteri.eposta;
    if (musteri.adres) guncelVeriler.address = musteri.adres;
    if (musteri.musteri_no) guncelVeriler.customer_number = musteri.musteri_no;

    const { data, error } = await supabase
      .from('customers')
      .update(guncelVeriler)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Müşteri sil
  async sil(id: number) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
