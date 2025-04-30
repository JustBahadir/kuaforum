
import { supabase } from '../client';
import { personelIslemleriServisi } from './personelIslemleriServisi';

export const randevuServisi = {
  // Helper function to get the current user's dukkan_id
  async _getCurrentUserDukkanId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Try to get dukkan_id from user metadata first
      const dukkanIdFromMeta = user?.user_metadata?.dukkan_id;
      if (dukkanIdFromMeta) return dukkanIdFromMeta;
      
      // If not in metadata, try profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileData?.dukkan_id) return profileData.dukkan_id;
      
      // Try personel table
      const { data: personelData } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      if (personelData?.dukkan_id) return personelData.dukkan_id;
      
      // As fallback, try to get shop ID where user is owner
      const { data: shopData } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .maybeSingle();
      
      return shopData?.id || null;
    } catch (error) {
      console.error("Error getting dukkan_id:", error);
      return null;
    }
  },
  
  async hepsiniGetir() {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        return [];
      }
      
      const { data, error } = await supabase.rpc('get_appointments_by_dukkan', { p_dukkan_id: dukkanId });
      
      if (error) {
        console.error("Error fetching appointments:", error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in randevuServisi.hepsiniGetir:", error);
      return [];
    }
  },
  
  async getir(id) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        return null;
      }
      
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (first_name, last_name, phone),
          personel:personel_id (ad_soyad)
        `)
        .eq('id', id)
        .eq('dukkan_id', dukkanId)
        .single();
      
      if (error) {
        console.error("Error fetching appointment:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error in randevuServisi.getir:", error);
      return null;
    }
  },
  
  // New method to get appointments by customer ID
  async musteriRandevulari(musteriId) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        return [];
      }
      
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (first_name, last_name, phone),
          personel:personel_id (ad_soyad)
        `)
        .eq('musteri_id', musteriId)
        .eq('dukkan_id', dukkanId)
        .order('tarih', { ascending: false });
      
      if (error) {
        console.error("Error fetching customer appointments:", error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in randevuServisi.musteriRandevulari:", error);
      return [];
    }
  },
  
  async ekle(randevu) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        throw new Error("İşletme bilgisi bulunamadı");
      }
      
      console.log("Adding appointment with shop ID:", dukkanId);
      
      // Use RPC function to add appointment
      const { data, error } = await supabase.rpc(
        'create_appointment',
        {
          p_dukkan_id: dukkanId,
          p_musteri_id: randevu.musteri_id,
          p_personel_id: randevu.personel_id,
          p_tarih: randevu.tarih,
          p_saat: randevu.saat,
          p_durum: randevu.durum || 'onaylandi',
          p_notlar: randevu.notlar || '',
          p_islemler: randevu.islemler || [],
          p_customer_id: randevu.customer_id
        }
      );
      
      if (error) {
        console.error("Error adding appointment:", error);
        throw error;
      }
      
      // Update statistics
      await personelIslemleriServisi.updateShopStatistics(dukkanId);
      
      return data;
    } catch (error) {
      console.error("Error in randevuServisi.ekle:", error);
      throw error;
    }
  },
  
  async guncelle(id, updates) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        throw new Error("İşletme bilgisi bulunamadı");
      }
      
      // First verify this appointment belongs to our business
      const { data: appointmentData } = await supabase
        .from('randevular')
        .select('dukkan_id')
        .eq('id', id)
        .single();
        
      if (appointmentData?.dukkan_id !== dukkanId) {
        throw new Error("Bu randevu sizin işletmenize ait değil");
      }
      
      // Don't allow changing dukkan_id
      delete updates.dukkan_id;
      
      const { data, error } = await supabase
        .from('randevular')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Error updating appointment:", error);
        throw error;
      }
      
      // If status changed to completed, create operations
      if (updates.durum === 'tamamlandi') {
        try {
          // Get the appointment with all details
          const appointment = await this.getir(id);
          
          if (appointment && appointment.islemler && appointment.islemler.length > 0) {
            // Get islemler details
            const { data: islemlerData } = await supabase
              .from('islemler')
              .select('*')
              .in('id', appointment.islemler);
              
            const islemlerMap = {};
            if (islemlerData) {
              islemlerData.forEach(islem => {
                islemlerMap[islem.id] = islem;
              });
            }
            
            // Get personel details for prime_yuzdesi
            const { data: personelData } = await supabase
              .from('personel')
              .select('*')
              .eq('id', appointment.personel_id)
              .single();
            
            // Create operation records
            for (const islemId of appointment.islemler) {
              const islem = islemlerMap[islemId];
              if (islem) {
                await personelIslemleriServisi.ekle({
                  personel_id: appointment.personel_id,
                  islem_id: islem.id,
                  tutar: islem.fiyat,
                  odenen: islem.fiyat,
                  prim_yuzdesi: personelData?.prim_yuzdesi || 0,
                  puan: islem.puan,
                  aciklama: islem.islem_adi,
                  musteri_id: appointment.musteri_id,
                  randevu_id: appointment.id
                });
              }
            }
          }
        } catch (operationError) {
          console.error("Error creating operations for completed appointment:", operationError);
          // Don't throw error here, as the appointment update was successful
        }
      }
      
      // Update statistics
      await personelIslemleriServisi.updateShopStatistics(dukkanId);
      
      return data[0];
    } catch (error) {
      console.error("Error in randevuServisi.guncelle:", error);
      throw error;
    }
  },
  
  async durumGuncelle(id, yeniDurum) {
    try {
      return await this.guncelle(id, { durum: yeniDurum });
    } catch (error) {
      console.error("Error in randevuServisi.durumGuncelle:", error);
      throw error;
    }
  },
  
  async sil(id) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        throw new Error("İşletme bilgisi bulunamadı");
      }
      
      // First verify this appointment belongs to our business
      const { data: appointmentData } = await supabase
        .from('randevular')
        .select('dukkan_id')
        .eq('id', id)
        .single();
        
      if (appointmentData?.dukkan_id !== dukkanId) {
        throw new Error("Bu randevu sizin işletmenize ait değil");
      }
      
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('id', id)
        .eq('dukkan_id', dukkanId);
      
      if (error) {
        console.error("Error deleting appointment:", error);
        throw error;
      }
      
      // Update statistics
      await personelIslemleriServisi.updateShopStatistics(dukkanId);
      
      return true;
    } catch (error) {
      console.error("Error in randevuServisi.sil:", error);
      throw error;
    }
  }
};
