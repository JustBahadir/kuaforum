
import { supabase } from '../client';
import { PersonelIslemi } from '../types';

// Define the Supabase URL and key for edge function calls
const SUPABASE_URL = "https://xkbjjcizncwkrouvoujw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw";

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

  // Method to recover operations from appointments using edge function
  async recoverOperations(options: { customer_id?: number, personnel_id?: number, get_all?: boolean } = {}): Promise<PersonelIslemi[]> {
    try {
      console.info(`İşlemler kurtarılıyor:`, options);
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/recover_customer_operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          customer_id: options.customer_id,
          personnel_id: options.personnel_id,
          get_all_shop_operations: options.get_all
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Kurtarma işlemi başarısız: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Kurtarma hatası: ${result.error}`);
      }
      
      console.info(`${result.count} işlem kurtarıldı`);
      return result.operations || [];
    } catch (error) {
      console.error("İşlemler kurtarılırken hata:", error);
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
