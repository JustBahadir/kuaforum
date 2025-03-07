
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
        throw new Error("dukkan_id is required");
      }
      
      if (!randevu.musteri_id) {
        throw new Error("musteri_id is required");
      }
      
      if (!randevu.personel_id) {
        throw new Error("personel_id is required");
      }
      
      if (!randevu.tarih || !randevu.saat) {
        throw new Error("tarih and saat are required");
      }

      // Ensure islemler is an array even if only one service is selected
      const islemler = Array.isArray(randevu.islemler) 
        ? randevu.islemler 
        : randevu.islemler ? [randevu.islemler] : [];

      // Prepare insert data
      const insertData = {
        dukkan_id: randevu.dukkan_id,
        musteri_id: randevu.musteri_id,
        personel_id: randevu.personel_id,
        tarih: randevu.tarih,
        saat: randevu.saat,
        durum: randevu.durum || "onaylandi",
        notlar: randevu.notlar || "",
        islemler: islemler,
        customer_id: randevu.customer_id || randevu.musteri_id.toString()
      };
      
      console.log("Formatted appointment data:", insertData);

      // Use raw insert without joins to avoid recursion issues
      const { data, error } = await supabase
        .from('randevular')
        .insert(insertData)
        .select('id')
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw new Error(error.message || "Randevu eklenirken bir hata oluştu");
      }
      
      if (!data) {
        throw new Error("Randevu eklendi ancak veri döndürülemedi");
      }
      
      // Fetch the complete record with relations
      const { data: fullRecord, error: fetchError } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteriler(*),
          personel:personel(*)
        `)
        .eq('id', data.id)
        .single();
        
      if (fetchError) {
        console.error("Error fetching created appointment:", fetchError);
        // Return the basic record anyway since it was created
        return { ...insertData, id: data.id };
      }
      
      console.log("Randevu başarıyla eklendi:", fullRecord);
      return fullRecord;
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
