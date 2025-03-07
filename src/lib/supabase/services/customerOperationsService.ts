
import { supabase } from '../client';
import { randevuServisi } from './randevuServisi';
import { personelServisi } from './personelServisi';
import { islemServisi } from './islemServisi';

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
      // Fetch customer's appointments
      const appointments = await randevuServisi.kendiRandevulariniGetir();
      
      // Fetch all services
      const allServices = await islemServisi.hepsiniGetir();
      
      // Fetch all personnel
      const allPersonnel = await personelServisi.hepsiniGetir();
      
      // Create operations from the appointments
      const operations: CustomerOperation[] = [];
      
      for (const appointment of appointments) {
        // Only include completed appointments
        if (appointment.durum === 'tamamlandi') {
          // Handle multiple services in one appointment
          const serviceIds = appointment.islemler || [];
          
          for (const serviceId of serviceIds) {
            const service = allServices.find(s => s.id === serviceId);
            const personnel = allPersonnel.find(p => p.id === appointment.personel_id);
            
            if (service) {
              operations.push({
                id: appointment.id,
                date: appointment.tarih,
                service_name: service.islem_adi,
                personnel_name: personnel?.ad_soyad || 'Belirtilmemiş',
                amount: parseFloat(service.fiyat),
                points: parseFloat(service.puan),
                notes: appointment.notlar || '',
                appointment_id: appointment.id
              });
            }
          }
        }
      }
      
      // Sort by date descending
      return operations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
