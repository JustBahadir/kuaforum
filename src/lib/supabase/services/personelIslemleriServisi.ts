
import { supabase } from '../client';
import { PersonelIslemi } from '../types';

export const personelIslemleriServisi = {
  // Get all staff operations
  async hepsiniGetir() {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          islem:islemler(*),
          personel:personel(*),
          musteri:musteriler(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching all personnel operations:", error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} personnel operations`);
      return data || [];
    } catch (error) {
      console.error("Error in hepsiniGetir:", error);
      return [];
    }
  },

  // Get operations for a specific staff member
  async personelIslemleriGetir(personelId: number) {
    try {
      console.log(`Fetching operations for personnel ID: ${personelId}`);
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          islem:islemler(*),
          personel:personel(*),
          musteri:musteriler(*)
        `)
        .eq('personel_id', personelId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching operations for personnel ID ${personelId}:`, error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} operations for personnel ID: ${personelId}`);
      
      // If no operations found, attempt to recover from randevular table
      if (!data || data.length === 0) {
        console.log("No operations found, attempting to recover from appointments...");
        await this.recoverOperationsFromAppointments(personelId);
        
        // Try again after recovery attempt
        const { data: retryData, error: retryError } = await supabase
          .from('personel_islemleri')
          .select(`
            *,
            islem:islemler(*),
            personel:personel(*),
            musteri:musteriler(*)
          `)
          .eq('personel_id', personelId)
          .order('created_at', { ascending: false });
          
        if (retryError) {
          console.error(`Error on retry fetching operations:`, retryError);
        }
        
        return retryData || [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in personelIslemleriGetir:", error);
      return [];
    }
  },

  // Get operations for a specific customer
  async musteriIslemleriGetir(musteriId: number) {
    try {
      console.log(`Fetching operations for customer ID: ${musteriId}`);
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          islem:islemler(*),
          personel:personel(*),
          musteri:musteriler(*)
        `)
        .eq('musteri_id', musteriId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching operations for customer ID ${musteriId}:`, error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} operations for customer ID: ${musteriId}`);
      
      // If no operations found, attempt to recover from randevular table
      if (!data || data.length === 0) {
        console.log("No operations found, attempting to recover from appointments...");
        await this.recoverOperationsFromCustomerAppointments(musteriId);
        
        // Try again after recovery attempt
        const { data: retryData, error: retryError } = await supabase
          .from('personel_islemleri')
          .select(`
            *,
            islem:islemler(*),
            personel:personel(*),
            musteri:musteriler(*)
          `)
          .eq('musteri_id', musteriId)
          .order('created_at', { ascending: false });
          
        if (retryError) {
          console.error(`Error on retry fetching operations:`, retryError);
        }
        
        return retryData || [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in musteriIslemleriGetir:", error);
      return [];
    }
  },

  // Add a new operation
  async ekle(islemi: Omit<PersonelIslemi, 'id' | 'created_at'> & { 
    musteri_id?: number; 
    tarih?: string; 
    notlar?: string;
    randevu_id?: number;
  }) {
    try {
      console.log("Adding new personnel operation:", islemi);
      
      // Check if an operation with this randevu_id and islem_id already exists
      if (islemi.randevu_id && islemi.islem_id && islemi.personel_id) {
        const { data: existingOps } = await supabase
          .from('personel_islemleri')
          .select('id')
          .eq('randevu_id', islemi.randevu_id)
          .eq('islem_id', islemi.islem_id)
          .eq('personel_id', islemi.personel_id);
          
        if (existingOps && existingOps.length > 0) {
          console.log(`Operation already exists for randevu ID ${islemi.randevu_id} and islem ID ${islemi.islem_id}. Updating.`);
          
          // Update the existing record
          const { data: updatedOp, error: updateError } = await supabase
            .from('personel_islemleri')
            .update({
              tutar: islemi.tutar,
              puan: islemi.puan,
              prim_yuzdesi: islemi.prim_yuzdesi,
              odenen: islemi.odenen,
              aciklama: islemi.aciklama,
              notlar: islemi.notlar,
              musteri_id: islemi.musteri_id
            })
            .eq('id', existingOps[0].id)
            .select(`
              *,
              islem:islemler(*),
              personel:personel(*),
              musteri:musteriler(*)
            `)
            .single();
            
          if (updateError) {
            console.error("Error updating existing operation:", updateError);
            throw updateError;
          }
            
          console.log("Successfully updated existing operation:", updatedOp);
          return updatedOp;
        }
      }
      
      // Prepare the insertion object
      const insertData = {
        personel_id: islemi.personel_id,
        islem_id: islemi.islem_id,
        tutar: islemi.tutar,
        puan: islemi.puan,
        prim_yuzdesi: islemi.prim_yuzdesi,
        odenen: islemi.odenen,
        aciklama: islemi.aciklama,
        musteri_id: islemi.musteri_id,
        notlar: islemi.notlar,
        randevu_id: islemi.randevu_id
      };
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .insert([insertData])
        .select(`
          *,
          islem:islemler(*),
          personel:personel(*),
          musteri:musteriler(*)
        `)
        .single();

      if (error) {
        console.error("Error adding personnel operation:", error);
        throw error;
      }
      
      console.log("Successfully added personnel operation:", data);
      return data;
    } catch (error) {
      console.error("Error in ekle:", error);
      throw error;
    }
  },

  // Update an operation
  async guncelle(id: number, updates: Partial<PersonelIslemi> & { notlar?: string }) {
    try {
      console.log(`Updating operation ID ${id}:`, updates);
      const { data, error } = await supabase
        .from('personel_islemleri')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          islem:islemler(*),
          personel:personel(*),
          musteri:musteriler(*)
        `)
        .single();

      if (error) {
        console.error(`Error updating operation ID ${id}:`, error);
        throw error;
      }
      
      console.log(`Successfully updated operation ID ${id}:`, data);
      return data;
    } catch (error) {
      console.error("Error in guncelle:", error);
      throw error;
    }
  },

  // Delete an operation
  async sil(id: number) {
    try {
      console.log(`Deleting operation ID: ${id}`);
      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting operation ID ${id}:`, error);
        throw error;
      }
      
      console.log(`Successfully deleted operation ID: ${id}`);
      return true;
    } catch (error) {
      console.error("Error in sil:", error);
      throw error;
    }
  },

  // Recover operations from completed appointments for personnel
  async recoverOperationsFromAppointments(personelId: number) {
    try {
      console.log(`Attempting to recover operations for personnel ID: ${personelId} from completed appointments`);
      
      // Get all completed appointments for this personnel
      const { data: appointments, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteriler(*),
          personel:personel(*)
        `)
        .eq('personel_id', personelId)
        .eq('durum', 'tamamlandi');
        
      if (error || !appointments || appointments.length === 0) {
        console.log(`No completed appointments found for personnel ID: ${personelId}`);
        return [];
      }
      
      console.log(`Found ${appointments.length} completed appointments for personnel recovery`);
      
      // Process each appointment
      const createdOperations = [];
      for (const appointment of appointments) {
        try {
          // Get service IDs
          const islemIds = appointment.islemler || [];
          if (!islemIds || islemIds.length === 0) continue;
          
          // Get service details
          const { data: services } = await supabase
            .from('islemler')
            .select('*')
            .in('id', islemIds);
            
          if (!services || services.length === 0) continue;
          
          const personelData = appointment.personel;
          const primYuzdesi = personelData?.prim_yuzdesi || 0;
          
          // Create customer name
          let musteriAdi = "Belirtilmemiş";
          if (appointment.musteri) {
            musteriAdi = `${appointment.musteri.first_name || ''} ${appointment.musteri.last_name || ''}`.trim();
          }
          
          // Create operation records
          for (const service of services) {
            try {
              const tutar = parseFloat(service.fiyat) || 0;
              const odenenPrim = (tutar * primYuzdesi) / 100;
              
              // Check if operation already exists
              const { data: existing } = await supabase
                .from('personel_islemleri')
                .select('id')
                .eq('randevu_id', appointment.id)
                .eq('islem_id', service.id)
                .eq('personel_id', personelId);
                
              if (existing && existing.length > 0) {
                console.log(`Operation already exists, updating: ${existing[0].id}`);
                
                // Update the existing record
                const { data: updatedOp } = await supabase
                  .from('personel_islemleri')
                  .update({
                    tutar: tutar,
                    puan: parseInt(service.puan) || 0,
                    prim_yuzdesi: primYuzdesi,
                    odenen: odenenPrim,
                    aciklama: `${service.islem_adi} hizmeti verildi - ${musteriAdi} (Randevu #${appointment.id})`,
                    notlar: appointment.notlar || '',
                    musteri_id: appointment.musteri_id
                  })
                  .eq('id', existing[0].id)
                  .select('*');
                  
                if (updatedOp) {
                  createdOperations.push(updatedOp);
                  console.log("Updated existing operation:", updatedOp);
                }
                
                continue;
              }
              
              // Create new operation
              const personelIslem = {
                personel_id: personelId,
                islem_id: service.id,
                tutar: tutar,
                puan: parseInt(service.puan) || 0,
                prim_yuzdesi: primYuzdesi,
                odenen: odenenPrim,
                musteri_id: appointment.musteri_id,
                randevu_id: appointment.id,
                aciklama: `${service.islem_adi} hizmeti verildi - ${musteriAdi} (Randevu #${appointment.id})`,
                notlar: appointment.notlar || ''
              };
              
              console.log("Creating recovered personnel operation:", personelIslem);
              
              const { data: insertedOp, error: insertError } = await supabase
                .from('personel_islemleri')
                .insert([personelIslem])
                .select('*');
                
              if (insertError) {
                console.error("Error creating recovered operation:", insertError);
              } else if (insertedOp) {
                console.log("Successfully created recovered operation:", insertedOp);
                createdOperations.push(insertedOp[0]);
              }
            } catch (serviceError) {
              console.error(`Error processing service ID ${service.id} for appointment ${appointment.id}:`, serviceError);
            }
          }
        } catch (appError) {
          console.error(`Error processing appointment ID ${appointment.id}:`, appError);
        }
      }
      
      console.log("Recovery operation completed for personnel, created:", createdOperations.length);
      return createdOperations;
    } catch (error) {
      console.error("Error in recoverOperationsFromAppointments:", error);
      return [];
    }
  },

  // Recover operations from completed appointments for customer
  async recoverOperationsFromCustomerAppointments(musteriId: number) {
    try {
      console.log(`Attempting to recover operations for customer ID: ${musteriId} from completed appointments`);
      
      // Get all completed appointments for this customer
      const { data: appointments, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteriler(*),
          personel:personel(*)
        `)
        .eq('musteri_id', musteriId)
        .eq('durum', 'tamamlandi');
        
      if (error || !appointments || appointments.length === 0) {
        console.log(`No completed appointments found for customer ID: ${musteriId}`);
        return [];
      }
      
      console.log(`Found ${appointments.length} completed appointments for customer recovery`);
      
      // Process each appointment
      const createdOperations = [];
      for (const appointment of appointments) {
        try {
          // Get service IDs
          const islemIds = appointment.islemler || [];
          if (!islemIds || islemIds.length === 0) continue;
          
          // Get service details
          const { data: services } = await supabase
            .from('islemler')
            .select('*')
            .in('id', islemIds);
            
          if (!services || services.length === 0) continue;
          
          const personelData = appointment.personel;
          const primYuzdesi = personelData?.prim_yuzdesi || 0;
          const personelId = appointment.personel_id;
          
          if (!personelId) {
            console.log(`No personnel assigned to appointment ${appointment.id}, skipping`);
            continue;
          }
          
          // Create customer name
          let musteriAdi = "Belirtilmemiş";
          if (appointment.musteri) {
            musteriAdi = `${appointment.musteri.first_name || ''} ${appointment.musteri.last_name || ''}`.trim();
          }
          
          // Create operation records
          for (const service of services) {
            try {
              const tutar = parseFloat(service.fiyat) || 0;
              const odenenPrim = (tutar * primYuzdesi) / 100;
              
              // Check if operation already exists
              const { data: existing } = await supabase
                .from('personel_islemleri')
                .select('id')
                .eq('randevu_id', appointment.id)
                .eq('islem_id', service.id)
                .eq('personel_id', personelId);
                
              if (existing && existing.length > 0) {
                console.log(`Operation already exists, updating: ${existing[0].id}`);
                
                // Update the existing record
                const { data: updatedOp } = await supabase
                  .from('personel_islemleri')
                  .update({
                    tutar: tutar,
                    puan: parseInt(service.puan) || 0,
                    prim_yuzdesi: primYuzdesi,
                    odenen: odenenPrim,
                    aciklama: `${service.islem_adi} hizmeti verildi - ${musteriAdi} (Randevu #${appointment.id})`,
                    notlar: appointment.notlar || '',
                    musteri_id: musteriId
                  })
                  .eq('id', existing[0].id)
                  .select('*');
                  
                if (updatedOp) {
                  createdOperations.push(updatedOp);
                  console.log("Updated existing operation:", updatedOp);
                }
                
                continue;
              }
              
              // Create new operation
              const personelIslem = {
                personel_id: personelId,
                islem_id: service.id,
                tutar: tutar,
                puan: parseInt(service.puan) || 0,
                prim_yuzdesi: primYuzdesi,
                odenen: odenenPrim,
                musteri_id: musteriId,
                randevu_id: appointment.id,
                aciklama: `${service.islem_adi} hizmeti verildi - ${musteriAdi} (Randevu #${appointment.id})`,
                notlar: appointment.notlar || ''
              };
              
              console.log("Creating recovered personnel operation:", personelIslem);
              
              const { data: insertedOp, error: insertError } = await supabase
                .from('personel_islemleri')
                .insert([personelIslem])
                .select('*');
                
              if (insertError) {
                console.error("Error creating recovered operation:", insertError);
              } else if (insertedOp) {
                console.log("Successfully created recovered operation:", insertedOp);
                createdOperations.push(insertedOp[0]);
              }
            } catch (serviceError) {
              console.error(`Error processing service ID ${service.id} for appointment ${appointment.id}:`, serviceError);
            }
          }
        } catch (appError) {
          console.error(`Error processing appointment ID ${appointment.id}:`, appError);
        }
      }
      
      console.log("Recovery operation completed for customer, created:", createdOperations.length);
      return createdOperations;
    } catch (error) {
      console.error("Error in recoverOperationsFromCustomerAppointments:", error);
      return [];
    }
  },
  
  // Get statistics for shop dashboard
  async getShopStatistics() {
    try {
      console.log("Fetching shop statistics");
      
      // Get all operations
      const { data: operations, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          islem:islemler(*),
          personel:personel(*),
          musteri:musteriler(*)
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching shop statistics:", error);
        throw error;
      }
      
      // Calculate basic statistics
      const totalRevenue = operations?.reduce((sum, op) => sum + (op.tutar || 0), 0) || 0;
      const totalServices = operations?.length || 0;
      const totalPoints = operations?.reduce((sum, op) => sum + (op.puan || 0), 0) || 0;
      const totalPaid = operations?.reduce((sum, op) => sum + (op.odenen || 0), 0) || 0;
      
      // Get unique customer count
      const uniqueCustomers = new Set();
      operations?.forEach(op => {
        if (op.musteri_id) uniqueCustomers.add(op.musteri_id);
      });
      
      // Personnel performance
      const personnelStats = {};
      operations?.forEach(op => {
        if (op.personel_id && op.personel) {
          const personelId = op.personel_id;
          if (!personnelStats[personelId]) {
            personnelStats[personelId] = {
              id: personelId,
              ad_soyad: op.personel.ad_soyad,
              islem_sayisi: 0,
              toplam_ciro: 0,
              toplam_odenen: 0,
              toplam_puan: 0,
            };
          }
          
          personnelStats[personelId].islem_sayisi++;
          personnelStats[personelId].toplam_ciro += (op.tutar || 0);
          personnelStats[personelId].toplam_odenen += (op.odenen || 0);
          personnelStats[personelId].toplam_puan += (op.puan || 0);
        }
      });
      
      // Get personnel performance data as array
      const personnelPerformance = Object.values(personnelStats);
      
      // Calculate percentage of total revenue for each personnel
      personnelPerformance.forEach(person => {
        person.ciro_yuzdesi = totalRevenue > 0 
          ? (person.toplam_ciro / totalRevenue * 100) 
          : 0;
        person.ortalama_puan = person.islem_sayisi > 0 
          ? (person.toplam_puan / person.islem_sayisi) 
          : 0;
      });
      
      return {
        totalRevenue,
        totalServices,
        totalPoints,
        totalPaid,
        uniqueCustomerCount: uniqueCustomers.size,
        personnelPerformance
      };
    } catch (error) {
      console.error("Error in getShopStatistics:", error);
      return {
        totalRevenue: 0,
        totalServices: 0,
        totalPoints: 0,
        totalPaid: 0,
        uniqueCustomerCount: 0,
        personnelPerformance: []
      };
    }
  },
  
  // Update shop statistics or create if not exists
  async updateShopStatistics() {
    try {
      console.log("Updating shop statistics");
      
      // Get statistics
      const stats = await this.getShopStatistics();
      
      // Update personnel_performans table
      for (const person of stats.personnelPerformance) {
        try {
          // Check if record exists
          const { data: existing } = await supabase
            .from('personel_performans')
            .select('id')
            .eq('id', person.id);
            
          if (existing && existing.length > 0) {
            // Update
            await supabase
              .from('personel_performans')
              .update({
                ad_soyad: person.ad_soyad,
                islem_sayisi: person.islem_sayisi,
                toplam_ciro: person.toplam_ciro,
                toplam_odenen: person.toplam_odenen,
                ortalama_puan: person.ortalama_puan,
                ciro_yuzdesi: person.ciro_yuzdesi
              })
              .eq('id', person.id);
          } else {
            // Insert
            await supabase
              .from('personel_performans')
              .insert([{
                id: person.id,
                ad_soyad: person.ad_soyad,
                islem_sayisi: person.islem_sayisi,
                toplam_ciro: person.toplam_ciro,
                toplam_odenen: person.toplam_odenen,
                ortalama_puan: person.ortalama_puan,
                ciro_yuzdesi: person.ciro_yuzdesi
              }]);
          }
        } catch (personError) {
          console.error(`Error updating performance for personnel ${person.id}:`, personError);
        }
      }
      
      console.log("Shop statistics update completed");
      return stats;
    } catch (error) {
      console.error("Error in updateShopStatistics:", error);
      return null;
    }
  }
};
