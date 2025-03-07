
import { supabase } from '../client';
import { Randevu } from '../types';

export const randevuServisi = {
  async hepsiniGetir() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('randevular')
      .select(`
        *,
        musteri:profiles(*),
        personel:personel(*)
      `)
      .order('tarih', { ascending: true })
      .order('saat', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async dukkanRandevulariniGetir(dukkanId: number) {
    if (!dukkanId) return [];

    const { data, error } = await supabase
      .from('randevular')
      .select(`
        *,
        musteri:profiles(*),
        personel:personel(*)
      `)
      .eq('dukkan_id', dukkanId)
      .order('tarih', { ascending: true })
      .order('saat', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async kendiRandevulariniGetir() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('randevular')
      .select(`
        *,
        musteri:profiles(*),
        personel:personel(*)
      `)
      .eq('customer_id', user.id)
      .order('tarih', { ascending: true })
      .order('saat', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async ekle(randevu: Omit<Randevu, 'id' | 'created_at' | 'musteri' | 'personel'>) {
    console.log("Randevu ekle service received data:", randevu);
    
    // Check for customer_id or musteri_id
    if (!randevu.customer_id && !randevu.musteri_id) {
      console.error("Required fields missing:", { customer_id: randevu.customer_id, musteri_id: randevu.musteri_id });
      throw new Error("customer_id or musteri_id is required");
    }

    // Ensure islemler is an array even if only one service is selected
    const islemler = Array.isArray(randevu.islemler) 
      ? randevu.islemler 
      : randevu.islemler ? [randevu.islemler] : [];

    try {
      const { data, error } = await supabase
        .from('randevular')
        .insert([{ 
          ...randevu, 
          islemler: islemler 
        }])
        .select(`
          *,
          musteri:profiles(*),
          personel:personel(*)
        `)
        .single();

      if (error) {
        console.error("Randevu eklenirken supabase hatası:", error);
        throw error;
      }
      
      console.log("Randevu başarıyla eklendi:", data);
      return data;
    } catch (error) {
      console.error("Randevu eklenirken hata:", error);
      throw error;
    }
  },

  async guncelle(id: number, randevu: Partial<Randevu>) {
    const { data, error } = await supabase
      .from('randevular')
      .update(randevu)
      .eq('id', id)
      .select(`
        *,
        musteri:profiles(*),
        personel:personel(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    const { error } = await supabase
      .from('randevular')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
