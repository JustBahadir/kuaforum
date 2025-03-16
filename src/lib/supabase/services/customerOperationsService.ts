
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
        
        // Try to fetch and convert appointments directly
        const operations = await this.getOperationsFromAppointments(customerId);
        
        if (operations && operations.length > 0) {
          console.log(`Found ${operations.length} operations from appointments`);
          return operations;
        }
        
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
          notes: item.notlar || ''
        };
      });
    } catch (error) {
      console.error('Error getting customer operations:', error);
      return [];
    }
  },

  async getOperationsFromAppointments(customerId: number | string): Promise<CustomerOperation[]> {
    try {
      console.log(`Directly fetching appointments for customer ID: ${customerId}`);
      
      // Get all completed appointments for this customer
      const { data: appointments, error } = await supabase
        .from('randevular')
        .select(`
          id,
          created_at,
          tarih,
          saat,
          islemler,
          notlar,
          personel_id,
          personel(ad_soyad, prim_yuzdesi)
        `)
        .eq('musteri_id', customerId)
        .eq('durum', 'tamamlandi')
        .order('tarih', { ascending: false });
        
      if (error || !appointments || appointments.length === 0) {
        console.log(`No completed appointments found for customer ID: ${customerId}`);
        return [];
      }
      
      console.log(`Found ${appointments.length} completed appointments`, appointments);
      
      // Process each appointment and convert it to operations
      const operations: CustomerOperation[] = [];
      
      for (const appointment of appointments) {
        try {
          // Convert appointment-level data to operations
          await this.processAppointmentToOperations(appointment, operations);
          
          // Also try to create records in personel_islemleri
          await this.convertAppointmentToOperations(appointment);
        } catch (err) {
          console.error(`Error processing appointment ID ${appointment.id}:`, err);
        }
      }
      
      return operations;
    } catch (error) {
      console.error('Error getting operations from appointments:', error);
      return [];
    }
  },

  async processAppointmentToOperations(appointment: any, operations: CustomerOperation[]): Promise<void> {
    // Get services information for this appointment
    const islemIds = appointment.islemler as any[];
    
    if (!islemIds || !islemIds.length) {
      console.log(`No services found for appointment ID: ${appointment.id}`);
      return;
    }
    
    try {
      // Fetch service details
      const { data: servicesData, error: serviceError } = await supabase
        .from('islemler')
        .select('*')
        .in('id', islemIds);
        
      if (serviceError || !servicesData) {
        console.error("Error fetching services:", serviceError);
        return;
      }
      
      // Get personnel name safely
      const personnelName = this.extractPersonnelName(appointment);
      
      // Create operation for each service
      for (const service of servicesData) {
        operations.push({
          id: appointment.id * 1000 + service.id, // Create unique ID
          date: appointment.created_at || `${appointment.tarih}T${appointment.saat}`,
          service_name: service.islem_adi,
          personnel_name: personnelName,
          amount: Number(service.fiyat) || 0,
          points: Number(service.puan) || 0,
          appointment_id: appointment.id,
          notes: appointment.notlar || ''
        });
      }
    } catch (error) {
      console.error(`Error processing services for appointment ${appointment.id}:`, error);
    }
  },
  
  extractPersonnelName(appointment: any): string {
    if (!appointment.personel) return 'Belirtilmemiş';
    
    if (typeof appointment.personel === 'object') {
      // It could be an object with ad_soyad property
      return appointment.personel.ad_soyad || 'Belirtilmemiş';
    }
    
    return 'Belirtilmemiş';
  },

  async convertAppointmentToOperations(appointment: any): Promise<void> {
    try {
      // Check if operations already exist for this appointment
      const { data: existingOps } = await supabase
        .from('personel_islemleri')
        .select('id')
        .eq('randevu_id', appointment.id);
        
      if (existingOps && existingOps.length > 0) {
        console.log(`Operations already exist for appointment ID: ${appointment.id}`);
        return;
      }
      
      // Get services information for this appointment
      const islemIds = appointment.islemler as any[];
      
      if (!islemIds || !islemIds.length) {
        console.log(`No services found for appointment ID: ${appointment.id}`);
        return;
      }
      
      // Fetch service details
      const { data: servicesData, error: serviceError } = await supabase
        .from('islemler')
        .select('*')
        .in('id', islemIds);
        
      if (serviceError || !servicesData) {
        console.error("Error fetching services:", serviceError);
        return;
      }
      
      // Extract prim_yuzdesi safely
      const primYuzdesi = this.extractPrimYuzdesi(appointment);
      
      // Create operation records
      for (const service of servicesData) {
        const tutar = parseFloat(service.fiyat) || 0;
        const odenenPrim = (tutar * primYuzdesi) / 100;
        
        const personelIslem = {
          personel_id: appointment.personel_id,
          islem_id: service.id,
          tutar: tutar,
          puan: parseInt(service.puan) || 0,
          prim_yuzdesi: primYuzdesi,
          odenen: odenenPrim,
          musteri_id: appointment.musteri_id,
          randevu_id: appointment.id,
          aciklama: `${service.islem_adi} hizmeti verildi. Randevu #${appointment.id}`,
          notlar: appointment.notlar || ''
        };
        
        console.log("Creating personnel operation from appointment:", personelIslem);
        
        const { error: insertError } = await supabase
          .from('personel_islemleri')
          .insert([personelIslem]);
          
        if (insertError) {
          console.error("Error creating operation record:", insertError);
        } else {
          console.log(`Successfully created operation record for service ID ${service.id}`);
        }
      }
    } catch (error) {
      console.error('Error converting appointment to operations:', error);
    }
  },

  extractPrimYuzdesi(appointment: any): number {
    if (!appointment.personel) return 0;
    
    if (typeof appointment.personel === 'object') {
      // It could be an object with prim_yuzdesi property
      return parseFloat(appointment.personel.prim_yuzdesi) || 0;
    }
    
    return 0;
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
