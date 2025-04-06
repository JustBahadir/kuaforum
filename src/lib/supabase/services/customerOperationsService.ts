
import { supabase } from '../client';

export interface CustomerOperation {
  id: number;
  date: string;
  created_at: string;
  service_name: string;
  personnel_name: string;
  amount: number;
  points: number;
  notes?: string;
  notlar?: string;
  appointment_id?: number;
  photos?: string[];
  islem?: {
    islem_adi: string;
  };
  personel?: {
    ad_soyad: string;
  };
  aciklama?: string;
  tutar?: number;
  puan?: number;
}

export const customerOperationsService = {
  async getCustomerOperations(customerId: string | number): Promise<CustomerOperation[]> {
    try {
      const customerIdStr = customerId.toString();
      console.log(`Fetching operations for customer ID: ${customerIdStr}`);
      
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
          personel:personel_id(ad_soyad),
          islem:islem_id(islem_adi)
        `)
        .eq('musteri_id', customerId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching customer operations:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log(`No operations found for customer ID: ${customerIdStr}`);
        
        // If no operations found, try to fetch from appointments
        console.log("Trying to recover operations from appointments");
        const operations = await this.recoverOperationsFromRandevular(customerIdStr);
        return operations;
      }
      
      // Transform the data with proper type handling
      return data.map(item => {
        // Initialize default values
        let serviceName = item.aciklama || 'İşlem';
        let personnelName = 'Belirtilmemiş';
        
        // Safely extract islem_adi if available
        if (item.islem && typeof item.islem === 'object') {
          const islemObj = item.islem as any;
          if (islemObj && 'islem_adi' in islemObj) {
            serviceName = islemObj.islem_adi || serviceName;
          }
        }
        
        // Safely extract ad_soyad if available
        if (item.personel && typeof item.personel === 'object') {
          const personelObj = item.personel as any;
          if (personelObj && 'ad_soyad' in personelObj) {
            personnelName = personelObj.ad_soyad || personnelName;
          }
        }
        
        return {
          id: item.id,
          date: item.created_at,
          created_at: item.created_at,
          service_name: serviceName,
          personnel_name: personnelName,
          amount: Number(item.tutar) || 0,
          points: Number(item.puan) || 0,
          appointment_id: item.randevu_id,
          notes: item.notlar || '',
          notlar: item.notlar || '',
          photos: item.photos || [],
          islem: {
            islem_adi: serviceName
          },
          personel: {
            ad_soyad: personnelName
          },
          aciklama: item.aciklama,
          tutar: Number(item.tutar) || 0,
          puan: Number(item.puan) || 0
        };
      });
    } catch (error) {
      console.error('Error getting customer operations:', error);
      return [];
    }
  },

  async recoverOperationsFromRandevular(customerId: string | number): Promise<CustomerOperation[]> {
    try {
      const customerIdStr = customerId.toString();
      console.log(`Trying to recover operations from randevular for customer ID: ${customerIdStr}`);
      
      // Direct query to get completed appointments using the new recover_customer_appointments function
      const { data: appointments, error: appointmentError } = await supabase
        .rpc('recover_customer_appointments', { 
          p_customer_id: parseInt(customerIdStr) 
        });
      
      if (appointmentError) {
        console.error("Error fetching customer appointments:", appointmentError);
        return [];
      }
      
      if (!appointments || appointments.length === 0) {
        console.log(`No completed appointments found for customer ID: ${customerIdStr}`);
        return [];
      }
      
      console.log(`Found ${appointments.length} completed appointments for customer ID: ${customerIdStr}`);
      
      // Transform appointments to operations format
      const operations = appointments.map((appointment: any) => {
        // Format date and time
        const appointmentDate = appointment.tarih ? 
          `${appointment.tarih}T${appointment.saat || '00:00:00'}` : 
          appointment.created_at;
          
        return {
          id: appointment.id,
          date: appointmentDate || new Date().toISOString(),
          created_at: appointmentDate || new Date().toISOString(),
          service_name: appointment.service_name || 'Randevu',
          personnel_name: appointment.personnel_name || 'Belirtilmemiş',
          amount: appointment.amount || 0,
          points: appointment.points || 0,
          appointment_id: appointment.id,
          notes: appointment.notlar || '',
          notlar: appointment.notes || '',
          photos: [],
          islem: {
            islem_adi: appointment.service_name || 'Randevu'
          },
          personel: {
            ad_soyad: appointment.personnel_name || 'Belirtilmemiş'
          },
          aciklama: appointment.service_name || 'Randevu',
          tutar: appointment.amount || 0,
          puan: appointment.points || 0
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
