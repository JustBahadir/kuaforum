import { supabase } from '../client';
import { PersonelIslemi } from '../types';

export const personelIslemleriServisi = {
  async hepsiniGetir(): Promise<PersonelIslemi[]> {
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

      if (error) {
        console.error("Personel işlemleri alınırken hata:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Personel işlemleri alınırken hata:", error);
      throw error;
    }
  },

  async personelIslemleriGetirById(personel_id: number): Promise<PersonelIslemi[]> {
    try {
      console.info(`${personel_id} ID'li personel işlemleri alınıyor...`);
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          musteri:musteri_id(*),
          islem:islem_id(*)
        `)
        .eq('personel_id', personel_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`${personel_id} ID'li personel işlemleri alınırken hata:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`${personel_id} ID'li personel işlemleri alınırken hata:`, error);
      throw error;
    }
  },

  // Method referenced in other files and needed for compatibility
  async personelIslemleriGetir(personel_id: number): Promise<PersonelIslemi[]> {
    // This is actually the same as personelIslemleriGetirById, just with a different name
    return this.personelIslemleriGetirById(personel_id);
  },

  // Method for retrieving operations related to a customer
  async musteriIslemleriGetir(musteri_id: number): Promise<PersonelIslemi[]> {
    try {
      console.info(`${musteri_id} ID'li müşteri işlemleri alınıyor...`);
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(*),
          musteri:musteri_id(*),
          islem:islem_id(*)
        `)
        .eq('musteri_id', musteri_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`${musteri_id} ID'li müşteri işlemleri alınırken hata:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`${musteri_id} ID'li müşteri işlemleri alınırken hata:`, error);
      throw error;
    }
  },

  // Method to create operations from completed appointments for a specific customer
  async recoverOperationsFromCustomerAppointments(musteri_id: number): Promise<boolean> {
    try {
      console.info(`${musteri_id} ID'li müşteri için randevulardan işlemler kurtarılıyor...`);
      
      const { data, error } = await supabase
        .rpc('recover_operations_from_customer_appointments', { p_customer_id: musteri_id });

      if (error) {
        console.error(`Müşteri işlemleri kurtarma hatası:`, error);
        throw error;
      }

      return data || false;
    } catch (error) {
      console.error(`Müşteri işlemleri kurtarma hatası:`, error);
      throw error;
    }
  },

  // Method to create operations from completed appointments for a specific personnel
  async recoverOperationsFromAppointments(personel_id: number): Promise<boolean> {
    try {
      console.info(`${personel_id} ID'li personel için randevulardan işlemler kurtarılıyor...`);
      
      const { data, error } = await supabase
        .rpc('recover_operations_from_appointments', { p_personel_id: personel_id });

      if (error) {
        console.error(`Personel işlemleri kurtarma hatası:`, error);
        throw error;
      }

      return data || false;
    } catch (error) {
      console.error(`Personel işlemleri kurtarma hatası:`, error);
      throw error;
    }
  },

  // Method to get shop statistics
  async getShopStatistics(): Promise<any> {
    try {
      console.info('Dükkan istatistikleri alınıyor...');
      
      const { data, error } = await supabase
        .rpc('get_shop_statistics');

      if (error) {
        console.error('Dükkan istatistikleri alınırken hata:', error);
        throw error;
      }

      return data || {
        totalRevenue: 0,
        totalServices: 0,
        uniqueCustomerCount: 0,
        totalCompletedAppointments: 0
      };
    } catch (error) {
      console.error('Dükkan istatistikleri alınırken hata:', error);
      return {
        totalRevenue: 0,
        totalServices: 0,
        uniqueCustomerCount: 0,
        totalCompletedAppointments: 0
      };
    }
  },

  // Method to update shop statistics
  async updateShopStatistics(): Promise<boolean> {
    try {
      console.info('Dükkan istatistikleri güncelleniyor...');
      
      const { data, error } = await supabase
        .rpc('update_shop_statistics');

      if (error) {
        console.error('Dükkan istatistikleri güncellenirken hata:', error);
        throw error;
      }

      return data || false;
    } catch (error) {
      console.error('Dükkan istatistikleri güncellenirken hata:', error);
      return false;
    }
  }
};
