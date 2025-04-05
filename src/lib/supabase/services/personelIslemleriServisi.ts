import { supabase } from '../client';
import { PersonelIslemi } from '../types';
import { toast } from 'sonner';

export const personelIslemleriServisi = {
  async directFetchPersonnelOperations(personelId: number) {
    try {
      console.log(`Directly fetching operations for personnel ID: ${personelId}`);
      
      return await supabase
        .from('personel_islemleri')
        .select(`
          *,
          islem:islem_id (islem_adi)
        `)
        .eq('personel_id', personelId)
        .order('created_at', { ascending: false });
      
    } catch (error) {
      console.error(`${personelId} ID'li personel işlemleri alınırken hata:`, error);
      throw error;
    }
  },

  async directRecoverOperations(personelId: number) {
    try {
      console.log(`Directly recovering operations for personnel ID: ${personelId}`);
      
      // Use Supabase REST call to avoid RLS recursion
      const { data, error } = await supabase.rpc(
        'recover_operations_from_appointments_for_personnel',
        { personnel_id: personelId }
      );
      
      if (error) throw error;
      return data;
      
    } catch (error) {
      console.error("Direct operation recovery failed:", error);
      toast.error("İşlemleri oluştururken bir hata oluştu");
      throw error;
    }
  },

  async personelIslemleriGetir(personelId: number): Promise<PersonelIslemi[]> {
    try {
      console.log(`${personelId} ID'li personel işlemleri alınıyor...`);
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          islem:islem_id (islem_adi),
          musteri:musteri_id (first_name, last_name)
        `)
        .eq('personel_id', personelId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error(`${personelId} ID'li personel işlemleri alınırken hata:`, error);
        throw error;
      }
      
      // Process data to include customer names
      return (data || []).map(item => {
        // Add a customer name field for display
        if (item.musteri) {
          item.musteri_name = `${item.musteri.first_name || ''} ${item.musteri.last_name || ''}`.trim();
        } else if (item.aciklama && item.aciklama.includes('-')) {
          // Try to extract customer name from description if available
          item.musteri_name = item.aciklama.split('-')[1]?.split('(')[0]?.trim() || 'Bilinmeyen';
        } else {
          item.musteri_name = 'Bilinmeyen';
        }
        return item;
      });
    } catch (error) {
      console.error(`${personelId} ID'li personel işlemleri alınırken hata:`, error);
      throw error;
    }
  },

  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select('*, personel:personel_id(*), islem:islem_id(*), musteri:musteri_id(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Personel işlemleri alınırken hata:", error);
      throw error;
    }

    return data || [];
  },

  async musteriIslemleriGetir(musteri_id: number) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select('*, personel:personel_id(*), islem:islem_id(*), musteri:musteri_id(*)')
      .eq('musteri_id', musteri_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`${musteri_id} ID'li müşteri işlemleri alınırken hata:`, error);
      throw error;
    }

    return data || [];
  },

  async ekle(islem: any) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .insert([islem])
      .select()
      .single();

    if (error) {
      console.error("Personel işlemi eklenirken hata:", error);
      throw error;
    }

    return data;
  },
  
  async recoverOperationsFromAppointments(personelId?: number) {
    try {
      console.log(`${personelId} ID'li personel için tamamlanmış randevular işlemler oluşturuluyor...`);
      
      // First try the direct method
      try {
        return await this.directRecoverOperations(personelId);
      } catch (directError) {
        console.error("Direct recovery failed, falling back to RPC:", directError);
        
        // Fallback to RPC call
        const { data, error } = await supabase
          .rpc('recover_operations_from_appointments_for_personnel', { 
            personnel_id: personelId 
          });
        
        if (error) {
          console.error("Randevulardan işlemler oluşturulurken hata:", error);
          throw error;
        }
        
        return data;
      }
    } catch (error) {
      console.error("Randevulardan işlemler oluşturulurken hata:", error);
      throw error;
    }
  },
  
  async recoverOperationsFromCustomerAppointments(customerId: number) {
    try {
      console.log(`Müşteri ID ${customerId} için tamamlanmış randevulardan işlemler oluşturuluyor...`);
      
      // Query to get completed appointments for this customer
      const { data: appointments, error } = await supabase
        .from('randevular')
        .select(`
          id,
          islemler,
          personel_id,
          musteri_id,
          customer_id,
          tarih,
          saat,
          notlar,
          durum,
          dukkan_id
        `)
        .eq('durum', 'tamamlandi')
        .eq('musteri_id', customerId);
      
      if (error) {
        console.error("Müşteri randevuları alınırken hata:", error);
        throw error;
      }
      
      if (!appointments || appointments.length === 0) {
        console.log("İşlenecek tamamlanmış müşteri randevusu bulunamadı");
        return { processed: 0, total: 0 };
      }
      
      console.log(`${appointments.length} adet tamamlanmış müşteri randevusu bulundu`);
      
      // Process each appointment using the same logic as recoverOperationsFromAppointments
      let processed = 0;
      let errors = 0;
      
      for (const appointment of appointments) {
        try {
          // Check if operation already exists for this appointment
          const { data: existingOperations } = await supabase
            .from('personel_islemleri')
            .select('id')
            .eq('randevu_id', appointment.id);
          
          if (existingOperations && existingOperations.length > 0) {
            console.log(`Randevu ID ${appointment.id} için işlem zaten mevcut, atlanıyor`);
            continue; // Skip if operation already exists
          }
          
          if (!appointment.personel_id) {
            console.warn(`Randevu ID ${appointment.id} için personel bilgisi yok, atlanıyor`);
            continue;
          }
          
          // Get personnel information to calculate commission percentage
          const { data: personel } = await supabase
            .from('personel')
            .select('prim_yuzdesi')
            .eq('id', appointment.personel_id)
            .maybeSingle();
          
          if (!personel) {
            console.warn(`Personel ID ${appointment.personel_id} bulunamadı, atlanıyor`);
            continue;
          }
          
          // Parse islemler JSON
          let islemler = [];
          try {
            islemler = Array.isArray(appointment.islemler) 
              ? appointment.islemler 
              : JSON.parse(appointment.islemler);
          } catch (e) {
            console.error(`Randevu ID ${appointment.id} için islemler JSON parse hatası:`, e);
            continue;
          }
          
          // Process each operation in the appointment
          for (const islem of islemler) {
            if (!islem.id || !islem.fiyat) {
              console.warn(`Randevu ID ${appointment.id} için geçersiz işlem verisi, atlanıyor`);
              continue;
            }
            
            // Get customer name
            let customerName = "Bilinmeyen Müşteri";
            if (appointment.musteri_id) {
              const { data: musteri } = await supabase
                .from('musteriler')
                .select('first_name, last_name')
                .eq('id', appointment.musteri_id)
                .maybeSingle();
                
              if (musteri) {
                customerName = `${musteri.first_name || ''} ${musteri.last_name || ''}`.trim();
              }
            }
            
            // Calculate commission
            const tutar = islem.fiyat || 0;
            const primYuzdesi = personel.prim_yuzdesi || 0;
            const odenen = (tutar * primYuzdesi) / 100;
            const puan = islem.puan || 0;
            
            // Create description
            const description = `${islem.islem_adi} - ${customerName} (${new Date(appointment.tarih).toLocaleDateString('tr-TR')} ${appointment.saat})`;
            
            // Create operation record
            const operationData = {
              personel_id: appointment.personel_id,
              islem_id: islem.id,
              randevu_id: appointment.id,
              musteri_id: appointment.musteri_id,
              tutar: tutar,
              odenen: odenen,
              prim_yuzdesi: primYuzdesi,
              puan: puan,
              aciklama: description,
              notlar: appointment.notlar || null,
              photos: [] // Initialize with empty photos array
            };
            
            // Insert operation
            const { error: insertError } = await supabase
              .from('personel_islemleri')
              .insert([operationData]);
              
            if (insertError) {
              console.error(`Randevu ID ${appointment.id} için işlem kaydı oluşturulurken hata:`, insertError);
              errors++;
            } else {
              processed++;
            }
          }
        } catch (appointmentError) {
          console.error(`Randevu ID ${appointment.id} işlenirken hata:`, appointmentError);
          errors++;
        }
      }
      
      console.log(`İşlem tamamlandı: ${processed} işlem oluşturuldu, ${errors} hata oluştu`);
      return { processed, errors, total: appointments.length };
      
    } catch (error) {
      console.error("Müşteri randevularından işlemler oluşturulurken hata:", error);
      throw error;
    }
  },

  async getShopStatistics() {
    try {
      console.log("Dükkan istatistikleri alınıyor...");
      
      // Get total revenue from personnel operations
      const { data: revenueData, error: revenueError } = await supabase
        .from('personel_islemleri')
        .select('tutar');
        
      if (revenueError) {
        console.error("Toplam ciro hesaplanırken hata:", revenueError);
        throw revenueError;
      }
      
      const totalRevenue = revenueData.reduce((sum, item) => sum + (item.tutar || 0), 0);
      
      // Get count of services (operations)
      const { count: totalServices, error: servicesError } = await supabase
        .from('personel_islemleri')
        .select('id', { count: 'exact', head: true });
        
      if (servicesError) {
        console.error("Toplam hizmet sayısı hesaplanırken hata:", servicesError);
        throw servicesError;
      }
      
      // Get count of unique customers
      const { data: customersData, error: customersError } = await supabase
        .from('personel_islemleri')
        .select('musteri_id');
        
      if (customersError) {
        console.error("Müşteri sayısı hesaplanırken hata:", customersError);
        throw customersError;
      }
      
      // Filter unique customer IDs and count them
      const uniqueCustomers = new Set();
      customersData.forEach(item => {
        if (item.musteri_id) {
          uniqueCustomers.add(item.musteri_id);
        }
      });
      
      const uniqueCustomerCount = uniqueCustomers.size;
      
      return {
        totalRevenue,
        totalServices: totalServices || 0,
        uniqueCustomerCount,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error("Dükkan istatistikleri alınırken hata:", error);
      throw error;
    }
  },

  async updateShopStatistics() {
    try {
      console.log("Dükkan istatistikleri güncelleniyor...");
      
      // Get current statistics
      const stats = await this.getShopStatistics();
      
      // You might want to persist these statistics in a database table
      // for faster retrieval in the future, but for now we just return them
      
      console.log("Dükkan istatistikleri güncellendi:", stats);
      
      return stats;
    } catch (error) {
      console.error("Dükkan istatistikleri güncellenirken hata:", error);
      throw error;
    }
  }
};
