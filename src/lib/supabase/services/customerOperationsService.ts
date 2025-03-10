
import { supabase } from '../client';
import { randevuServisi } from './randevuServisi';
import { personelServisi } from './personelServisi';
import { islemServisi } from './islemServisi';
import { personelIslemleriServisi } from './personelIslemleriServisi';

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
      // Get customer's ID from the musteriler table
      const { data: customerData } = await supabase
        .from('musteriler')
        .select('id')
        .eq('auth_id', customerId)
        .single();
      
      if (!customerData) {
        console.error("Customer not found in musteriler table");
        return [];
      }
      
      // Get operations for this customer directly from personel_islemleri
      const operationsData = await personelIslemleriServisi.musteriIslemleriGetir(customerData.id);
      
      // Create operations from the personel_islemleri data
      const operations: CustomerOperation[] = [];
      
      for (const op of operationsData) {
        if (op.islem) {
          operations.push({
            id: op.id,
            date: op.created_at,
            service_name: op.islem.islem_adi,
            personnel_name: op.personel?.ad_soyad || 'Belirtilmemiş',
            amount: parseFloat(op.tutar),
            points: parseFloat(op.puan),
            notes: op.aciklama || '',
            photos: op.photos || []
          });
        }
      }
      
      // Sort by date descending
      return operations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting customer operations:', error);
      return [];
    }
  },
  
  async updateOperationNotes(operationId: number, notes: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('personel_islemleri')
        .update({ aciklama: notes })
        .eq('id', operationId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating operation notes:', error);
      return false;
    }
  },
  
  async updateOperationPhotos(operationId: number, photos: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('personel_islemleri')
        .update({ photos })
        .eq('id', operationId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating operation photos:', error);
      return false;
    }
  }
};
