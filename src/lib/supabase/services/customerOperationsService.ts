
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
  photos?: string[];
}

export const customerOperationsService = {
  async getCustomerOperations(customerId: string): Promise<CustomerOperation[]> {
    try {
      console.log(`Fetching operations for customer ID: ${customerId}`);
      
      // Try to get operations directly from personel_islemleri table first
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
          photos,
          personel(ad_soyad),
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
          notes: item.notlar || '',
          photos: item.photos || []
        };
      });
    } catch (error) {
      console.error('Error getting customer operations:', error);
      return [];
    }
  },

  async updateOperationNotes(operationId: number, notes: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('personel_islemleri')
        .update({ notlar: notes })
        .eq('id', operationId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error updating operation notes:', error);
      throw error;
    }
  },
  
  async addOperationPhoto(operationId: number, photoUrl: string): Promise<void> {
    try {
      // First, get the current operation to check if it has existing photos
      const { data, error: fetchError } = await supabase
        .from('personel_islemleri')
        .select('photos')
        .eq('id', operationId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Prepare the updated photos array
      const existingPhotos = data?.photos || [];
      const updatedPhotos = [...existingPhotos, photoUrl];
      
      // Update the operation with the new photo
      const { error: updateError } = await supabase
        .from('personel_islemleri')
        .update({ photos: updatedPhotos })
        .eq('id', operationId);
        
      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error adding operation photo:', error);
      throw error;
    }
  }
};
