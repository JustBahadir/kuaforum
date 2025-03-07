
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
        musteri:musteriler(*),
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
        musteri:musteriler(*),
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
        musteri:musteriler(*),
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
    
    try {
      // Perform validation checks
      if (!randevu.dukkan_id) {
        console.error("Missing dukkan_id in randevu data", randevu);
        throw new Error("dukkan_id is required");
      }
      
      if (!randevu.musteri_id) {
        console.error("Missing musteri_id in randevu data", randevu);
        throw new Error("musteri_id is required");
      }
      
      if (!randevu.personel_id) {
        console.error("Missing personel_id in randevu data", randevu);
        throw new Error("personel_id is required");
      }
      
      if (!randevu.tarih || !randevu.saat) {
        console.error("Missing date or time in randevu data", randevu);
        throw new Error("tarih and saat are required");
      }

      // Handle customer_id validation - ensure it exists
      if (!randevu.customer_id) {
        console.warn("Missing customer_id, will use musteri_id as fallback", randevu);
        randevu.customer_id = randevu.musteri_id.toString();
      }

      // Ensure islemler is an array even if only one service is selected
      const islemler = Array.isArray(randevu.islemler) 
        ? randevu.islemler 
        : randevu.islemler ? [randevu.islemler] : [];
      
      console.log("Formatted appointment data:", { 
        ...randevu, 
        islemler 
      });

      // Direct insert without joins to avoid recursion issues
      const { data, error } = await supabase
        .from('randevular')
        .insert([{ 
          ...randevu, 
          islemler: islemler 
        }])
        .select('*')
        .single();

      if (error) {
        console.error("Randevu eklenirken supabase hatası:", error);
        throw error;
      }
      
      console.log("Randevu başarıyla eklendi:", data);
      return data;
    } catch (error: any) {
      console.error("Randevu eklenirken hata:", error);
      throw new Error(error?.message || "Randevu oluşturulurken bir hata oluştu");
    }
  },

  async guncelle(id: number, randevu: Partial<Randevu>) {
    const { data, error } = await supabase
      .from('randevular')
      .update(randevu)
      .eq('id', id)
      .select(`
        *,
        musteri:musteriler(*),
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
