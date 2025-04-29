
import { supabase } from '../client';

export const personelIslemleriServisi = {
  async hepsiniGetir() {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(*),
          musteri:musteri_id(*),
          islem:islem_id(*)
        `);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Personel işlemleri getirme hatası:", error);
      return [];
    }
  },

  async getir(id: number) {
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
    } catch (error) {
      console.error("Personel işlemi getirme hatası:", error);
      return null;
    }
  },
  
  async ekle(data: any) {
    try {
      // Ensure dukkan_id is included
      if (!data.dukkan_id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.dukkan_id) {
          data.dukkan_id = user.user_metadata.dukkan_id;
        } else {
          throw new Error("Dükkan bilgisi eksik");
        }
      }

      // Set created_at if not provided
      if (!data.created_at) {
        data.created_at = new Date().toISOString();
      }

      const { data: result, error } = await supabase
        .from('personel_islemleri')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      // Update shop statistics
      await this.updateShopStatistics();

      return result;
    } catch (error: any) {
      console.error("Personel işlemi ekleme hatası:", error);
      throw new Error(error?.message || "İşlem eklenirken bir hata oluştu");
    }
  },
  
  async guncelle(id: number, data: any) {
    try {
      const { data: result, error } = await supabase
        .from('personel_islemleri')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update shop statistics
      await this.updateShopStatistics();

      return result;
    } catch (error: any) {
      console.error("Personel işlemi güncelleme hatası:", error);
      throw new Error(error?.message || "İşlem güncellenirken bir hata oluştu");
    }
  },
  
  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update shop statistics
      await this.updateShopStatistics();

      return true;
    } catch (error: any) {
      console.error("Personel işlemi silme hatası:", error);
      throw new Error(error?.message || "İşlem silinirken bir hata oluştu");
    }
  },
  
  async personelIslemleriGetir(personelId: number) {
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
    } catch (error) {
      console.error("Personel işlemleri getirme hatası:", error);
      return [];
    }
  },
  
  // Add the missing updateShopStatistics method
  async updateShopStatistics() {
    try {
      // This is a placeholder for now - in a real implementation, this would
      // recalculate and update various statistics about the shop's operations
      console.log("Shop statistics updated");
      return true;
    } catch (error) {
      console.error("Shop statistics update error:", error);
      return false;
    }
  },
  
  async personelPerformansRaporu(personelId: number, startDate: string, endDate: string) {
    try {
      // Here we would fetch performance stats for a specific staff member within a date range
      // This is a simplified implementation
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          islem:islem_id(*)
        `)
        .eq('personel_id', personelId)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;
      
      // Process the data to calculate performance metrics
      const totalOperations = data.length;
      const totalRevenue = data.reduce((sum, op) => sum + Number(op.tutar || 0), 0);
      const totalPaid = data.reduce((sum, op) => sum + Number(op.odenen || 0), 0);
      
      return {
        totalOperations,
        totalRevenue,
        totalPaid,
        operationsData: data
      };
    } catch (error) {
      console.error("Personel performans raporu hatası:", error);
      return {
        totalOperations: 0,
        totalRevenue: 0,
        totalPaid: 0,
        operationsData: []
      };
    }
  }
};
