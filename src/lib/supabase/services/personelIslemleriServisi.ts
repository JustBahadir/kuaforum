
import { supabase } from '../client';
import { getCurrentDukkanId } from '../utils/getCurrentDukkanId';

export const personelIslemleriServisi = {
  async getCurrentDukkanId() {
    return await getCurrentDukkanId();
  },
  
  async hepsiniGetir(dukkanId?: number) {
    try {
      const currentDukkanId = dukkanId || await this.getCurrentDukkanId();
      if (!currentDukkanId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }

      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*')
        .eq('personel.dukkan_id', currentDukkanId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel işlemleri getirme hatası:', error);
      return [];
    }
  },

  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Personel işlemi getirme hatası:', error);
      throw error;
    }
  },

  async personelIslemleriniGetir(personelId: number) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          musteri:musteri_id(id, first_name, last_name)
        `)
        .eq('personel_id', personelId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel işlemleri getirme hatası:', error);
      return [];
    }
  },

  async musteriIslemleriniGetir(musteriId: number) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(id, ad_soyad)
        `)
        .eq('musteri_id', musteriId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Müşteri işlemleri getirme hatası:', error);
      return [];
    }
  },

  async ekle(islemData: any) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .insert(islemData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Personel işlemi ekleme hatası:', error);
      throw error;
    }
  },

  async guncelle(id: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Personel işlemi güncelleme hatası:', error);
      throw error;
    }
  },

  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Personel işlemi silme hatası:', error);
      throw error;
    }
  }
};
