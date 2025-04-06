
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
          islem:islem_id(islem_adi)
        `)
        .eq('musteri_id', customerId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching customer operations:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log(`No operations found for customer ID: ${customerId}`);
        
        // If no operations found, try to fetch from appointments
        console.log("Trying to recover operations from appointments");
        const operations = await this.recoverOperationsFromRandevular(customerId);
        return operations;
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

  async recoverOperationsFromRandevular(customerId: string): Promise<CustomerOperation[]> {
    try {
      console.log(`Trying to recover operations from randevular for customer ID: ${customerId}`);
      
      // Get appointments for this customer
      const { data: appointments, error: appointmentError } = await supabase
        .from('randevular')
        .select(`
          id,
          created_at,
          tarih,
          saat,
          durum,
          notlar,
          islemler,
          personel:personel_id(ad_soyad)
        `)
        .eq('musteri_id', customerId)
        .eq('durum', 'tamamlandi')
        .order('tarih', { ascending: false });
      
      if (appointmentError) {
        console.error("Error fetching customer appointments:", appointmentError);
        return [];
      }
      
      if (!appointments || appointments.length === 0) {
        console.log(`No completed appointments found for customer ID: ${customerId}`);
        return [];
      }
      
      console.log(`Found ${appointments.length} completed appointments for customer ID: ${customerId}`);
      
      // Transform appointments to operations format
      const operations = appointments.map(appointment => {
        // Parse islemler to get service details
        let serviceName = 'Randevu';
        let amount = 0;
        let points = 0;
        
        try {
          if (appointment.islemler && Array.isArray(appointment.islemler)) {
            // If islemler is an array, use the first item
            serviceName = `${appointment.islemler.length} işlem`;
            // Could fetch details for each işlem if needed
          }
        } catch (e) {
          console.error("Error parsing islemler:", e);
        }
        
        // Format date and time
        const appointmentDate = appointment.tarih ? 
          `${appointment.tarih}T${appointment.saat || '00:00:00'}` : 
          appointment.created_at;
        
        // Fix the type issue - ensure we handle personel correctly
        let personnelName = 'Belirtilmemiş';
        if (appointment.personel && typeof appointment.personel === 'object') {
          personnelName = (appointment.personel as any).ad_soyad || 'Belirtilmemiş';
        }
        
        return {
          id: appointment.id,
          date: appointmentDate || new Date().toISOString(),
          service_name: serviceName,
          personnel_name: personnelName,
          amount: amount,
          points: points,
          appointment_id: appointment.id,
          notes: appointment.notlar || '',
          photos: []
        };
      });
      
      return operations;
    } catch (error) {
      console.error('Error recovering operations from appointments:', error);
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
