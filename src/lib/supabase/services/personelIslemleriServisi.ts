
import { supabase } from '../client';
import { PersonelIslemi } from '../types';
import { toast } from 'sonner';

export const personelIslemleriServisi = {
  hepsiniGetir: async () => {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(*),
          musteri:musteri_id(*),
          islem:islem_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Personel işlemleri getirme hatası:', error);
      return [];
    }
  },

  getir: async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(*),
          musteri:musteri_id(*),
          islem:islem_id(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Personel işlemi getirme hatası:', error);
      return null;
    }
  },

  ekle: async (data: any) => {
    try {
      // Ensure dukkan_id is included
      if (!data.dukkan_id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.dukkan_id) {
          data.dukkan_id = user.user_metadata.dukkan_id;
        }
      }

      const { data: result, error } = await supabase
        .from('personel_islemleri')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } catch (error: any) {
      console.error('Personel işlemi ekleme hatası:', error);
      return null;
    }
  },

  guncelle: async (id: number, data: any) => {
    try {
      const { data: result, error } = await supabase
        .from('personel_islemleri')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } catch (error: any) {
      console.error('Personel işlemi güncelleme hatası:', error);
      return null;
    }
  },

  sil: async (id: number) => {
    try {
      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Personel işlemi silme hatası:', error);
      return false;
    }
  },

  personelIslemleriGetir: async (personelId: number) => {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(*),
          musteri:musteri_id(*),
          islem:islem_id(*)
        `)
        .eq('personel_id', personelId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Personel işlemleri getirme hatası:', error);
      return [];
    }
  },

  // Add the missing updateShopStatistics method
  updateShopStatistics: async () => {
    try {
      // Get the current user's dukkan_id
      const { data: { user } } = await supabase.auth.getUser();
      const dukkan_id = user?.user_metadata?.dukkan_id;

      if (!dukkan_id) {
        console.warn("Cannot update statistics: No dukkan_id found for current user");
        return false;
      }

      // Update statistics through a function call (assuming this exists on backend)
      const { data, error } = await supabase.rpc('update_shop_statistics', { 
        p_dukkan_id: dukkan_id 
      });

      if (error) {
        console.error("Statistics update error:", error);
        return false;
      }

      console.log("Shop statistics updated successfully", data);
      return true;
    } catch (error: any) {
      console.error("Failed to update shop statistics:", error);
      return false;
    }
  },

  personelPerformansRaporu: async (personelId: number, startDate: string, endDate: string) => {
    try {
      // Ensure we have valid dates
      if (!startDate || !endDate) {
        throw new Error("Başlangıç ve bitiş tarihleri gereklidir");
      }

      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(*),
          musteri:musteri_id(*),
          islem:islem_id(*)
        `)
        .eq('personel_id', personelId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Personel performans raporu hatası:', error);
      toast.error("Performans raporu oluşturulurken bir hata oluştu");
      return [];
    }
  }
};
