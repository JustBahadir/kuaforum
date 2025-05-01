
import { supabase } from '../client';
import { IslemDto } from '../types';
import { isletmeServisi } from './dukkanServisi';

export const islemServisi = {
  async getCurrentDukkanId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');
      
      // Check if user is admin
      const role = user.user_metadata?.role;
      
      if (role === 'admin') {
        // Admin user - get dukkan by user_id
        const { data, error } = await supabase
          .from('dukkanlar')
          .select('id')
          .eq('sahibi_id', user.id)
          .single();
          
        if (error) throw error;
        return data?.id;
      } else if (role === 'staff') {
        // Staff user - get dukkan through personeller
        const { data, error } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('auth_id', user.id)
          .single();
          
        if (error) throw error;
        return data?.dukkan_id;
      }
      
      // Try to get from profiles as last resort
      const { data, error } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data?.dukkan_id;
    } catch (error) {
      console.error('Dükkan ID getirme hatası:', error);
      return null;
    }
  },
  
  hepsiniGetir: async (dukkanId?: number) => {
    try {
      console.log("islemServisi.hepsiniGetir called with dukkanId:", dukkanId);
      
      let id = dukkanId;
      if (!id) {
        id = await islemServisi.getCurrentDukkanId();
        console.log("Fetched current dukkanId:", id);
      }
      
      if (!id) {
        console.error("No dukkan ID available");
        throw new Error('İşletme bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('dukkan_id', id)
        .order('sira');

      if (error) {
        console.error("Error fetching islemler:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} islemler`);
      return data || [];
    } catch (error) {
      console.error('İşlem listesi getirme hatası:', error);
      throw error;
    }
  },

  getir: async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('İşlem getirme hatası:', error);
      throw error;
    }
  },

  kategoriIdyeGoreGetir: async (kategoriId: number, dukkanId?: number) => {
    try {
      console.log(`islemServisi.kategoriIdyeGoreGetir called with kategoriId: ${kategoriId}, dukkanId: ${dukkanId}`);
      
      let id = dukkanId;
      if (!id) {
        id = await islemServisi.getCurrentDukkanId();
        console.log("Fetched current dukkanId:", id);
      }
      
      if (!id) {
        console.error("No dukkan ID available");
        throw new Error('İşletme bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('kategori_id', kategoriId)
        .eq('dukkan_id', id)
        .order('sira');

      if (error) {
        console.error("Error fetching islemler by kategoriId:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} islemler for kategoriId: ${kategoriId}`);
      return data || [];
    } catch (error) {
      console.error('Kategoriye göre işlemleri getirme hatası:', error);
      throw error;
    }
  },

  ekle: async (islemData: Partial<IslemDto>) => {
    try {
      console.log("Adding islem with data:", islemData);
      
      // Make sure we have a dukkan_id
      if (!islemData.dukkan_id) {
        const dukkanId = await islemServisi.getCurrentDukkanId();
        if (!dukkanId) {
          console.error("No dukkan ID available for adding islem");
          throw new Error('İşletme bilgisi bulunamadı');
        }
        islemData.dukkan_id = dukkanId;
      }
      
      const { data, error } = await supabase
        .from('islemler')
        .insert([islemData])
        .select();

      if (error) {
        console.error("Error adding islem:", error);
        throw error;
      }
      
      console.log("İşlem added:", data[0]);
      return data[0];
    } catch (error) {
      console.error('İşlem ekleme hatası:', error);
      throw error;
    }
  },

  guncelle: async (id: number, updates: Partial<IslemDto>) => {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('İşlem güncelleme hatası:', error);
      throw error;
    }
  },

  sil: async (id: number) => {
    try {
      const { error } = await supabase
        .from('islemler')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('İşlem silme hatası:', error);
      throw error;
    }
  },

  siralamaGuncelle: async (items: any[]) => {
    try {
      // Update each item in sequence to avoid race conditions
      for (const item of items) {
        const { error } = await supabase
          .from('islemler')
          .update({ sira: item.sira })
          .eq('id', item.id);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('İşlem sıralaması güncelleme hatası:', error);
      throw error;
    }
  }
};
