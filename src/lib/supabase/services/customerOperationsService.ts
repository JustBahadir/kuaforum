
import { supabase } from '../client';

export interface CustomerOperation {
  id: number;
  date: string;
  service_name: string;
  personnel_name: string;
  amount: number;
  points: number;
  notes?: string;
  appointment_id?: number;
}

export const customerOperationsService = {
  async getCustomerOperations(customerId: string): Promise<CustomerOperation[]> {
    try {
      // Fetch operations directly from the personel_islemleri table
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          id,
          created_at,
          aciklama,
          tutar,
          puan,
          notlar,
          randevu_id,
          personel:personel(ad_soyad),
          islem:islemler(islem_adi)
        `)
        .eq('musteri_id', customerId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      // Transform the data
      return data.map(item => ({
        id: item.id,
        date: item.created_at,
        service_name: item.islem?.islem_adi || item.aciklama.split(' hizmeti verildi')[0],
        personnel_name: item.personel?.ad_soyad || 'Belirtilmemiş',
        amount: item.tutar,
        notes: item.notlar || '',
        points: item.puan,
        appointment_id: item.randevu_id
      }));
    } catch (error) {
      console.error('Error getting customer operations:', error);
      return [];
    }
  },
  
  async updateOperationNotes(appointmentId: number, notes: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('randevular')
        .update({ notlar: notes })
        .eq('id', appointmentId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating operation notes:', error);
      return false;
    }
  }
};
