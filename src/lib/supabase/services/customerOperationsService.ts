
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
  async getCustomerOperations(customerId: number | string): Promise<CustomerOperation[]> {
    try {
      console.log(`Fetching operations for customer ID: ${customerId}`);
      
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
        
      if (error) {
        console.error("Error fetching customer operations:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log(`No operations found for customer ID: ${customerId}`);
        return [];
      }
      
      console.log(`Found ${data.length} operations for customer ID: ${customerId}`, data);
      
      // Transform the data with proper type handling
      return data.map(item => {
        // Default values in case the relations are null
        let serviceName = item.aciklama;
        let personnelName = 'Belirtilmemiş';
        
        // Safely extract islem_adi if available
        if (item.islem && typeof item.islem === 'object') {
          serviceName = (item.islem as any).islem_adi || serviceName;
        }
        
        // Safely extract ad_soyad if available
        if (item.personel && typeof item.personel === 'object') {
          personnelName = (item.personel as any).ad_soyad || personnelName;
        }
        
        return {
          id: item.id,
          date: item.created_at,
          service_name: serviceName,
          personnel_name: personnelName,
          amount: Number(item.tutar) || 0,
          points: Number(item.puan) || 0,
          appointment_id: item.randevu_id,
          notes: item.notlar
        };
      });
    } catch (error) {
      console.error('Error getting customer operations:', error);
      return [];
    }
  },

  async updateOperationNotes(operationId: number, notes: string): Promise<void> {
    try {
      console.log(`Updating notes for operation ID: ${operationId}`, notes);
      
      const { error } = await supabase
        .from('personel_islemleri')
        .update({ notlar: notes })
        .eq('id', operationId);
        
      if (error) {
        console.error("Error updating operation notes:", error);
        throw error;
      }
      
      console.log(`Successfully updated notes for operation ID: ${operationId}`);
    } catch (error) {
      console.error('Error updating operation notes:', error);
      throw error;
    }
  }
};
