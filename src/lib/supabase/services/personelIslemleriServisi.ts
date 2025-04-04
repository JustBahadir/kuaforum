
import { supabase } from '../client';

export const personelIslemleriServisi = {
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

  async personelIslemleriGetir(personel_id: number) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select('*, personel:personel_id(*), islem:islem_id(*), musteri:musteri_id(*)')
      .eq('personel_id', personel_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`${personel_id} ID'li personel işlemleri alınırken hata:`, error);
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
      console.log("Tamamlanmış randevulardan işlemler oluşturuluyor...");
      
      // Query to get completed appointments
      let query = supabase
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
        .eq('durum', 'tamamlandi');
      
      // Filter by personel_id if provided
      if (personelId) {
        query = query.eq('personel_id', personelId);
      }
      
      const { data: appointments, error } = await query;
      
      if (error) {
        console.error("Tamamlanmış randevular alınırken hata:", error);
        throw error;
      }
      
      if (!appointments || appointments.length === 0) {
        console.log("İşlenecek tamamlanmış randevu bulunamadı");
        return { processed: 0, total: 0 };
      }
      
      console.log(`${appointments.length} adet tamamlanmış randevu bulundu`);
      
      // Process each appointment to create operations
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
              notlar: appointment.notlar || null
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
      console.error("Randevulardan işlemler oluşturulurken hata:", error);
      throw error;
    }
  }
};
