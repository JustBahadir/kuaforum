
import { supabase } from '../client';
import { Musteri } from '../types';

export const musteriServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        phone,
        created_at
      `);

    if (error) throw error;
    return data || [];
  },

  async istatistiklerGetir() {
    // İlk olarak tüm müşterileri alalım
    const { data: musteriler, error: musteriError } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        phone,
        created_at
      `);

    if (musteriError) throw musteriError;

    // Tüm randevuları alalım
    const { data: randevular, error: randevuError } = await supabase
      .from('randevular')
      .select('*');

    if (randevuError) throw randevuError;

    // Tüm personel işlemlerini alalım
    const { data: islemler, error: islemError } = await supabase
      .from('personel_islemleri')
      .select('*');

    if (islemError) throw islemError;

    // Her müşteri için istatistikleri hesaplayalım
    const sonuclar = musteriler?.map(musteri => {
      const musteriRandevulari = randevular?.filter(r => r.customer_id === musteri.id) || [];
      const musteriIslemleri = islemler?.filter(i => i.musteri_id === musteri.id) || [];
      
      return {
        ...musteri,
        total_appointments: musteriRandevulari.length,
        total_services: musteriIslemleri.length
      };
    }) || [];

    return sonuclar;
  },

  async ara(aramaMetni: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        phone,
        created_at
      `)
      .or(`first_name.ilike.%${aramaMetni}%,last_name.ilike.%${aramaMetni}%,phone.ilike.%${aramaMetni}%`);

    if (error) throw error;
    return data || [];
  },

  async ekle(musteri: Omit<Musteri, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([musteri])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: string, musteri: Partial<Musteri>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(musteri)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
