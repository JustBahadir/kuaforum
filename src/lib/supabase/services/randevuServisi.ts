
import { supabase } from '../client';
import { Randevu, RandevuDurumu } from '../types';

export const randevuServisi = {
  // Get appointments for a specific shop
  async dukkanRandevulariniGetir(dukkanId: number | null) {
    try {
      if (!dukkanId) {
        // Try to get the current user's dukkan_id
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("Kullanıcı bilgisi bulunamadı");
          return [];
        }
        
        // Try to get from user metadata
        const dukkanIdFromMeta = user.user_metadata?.dukkan_id;
        if (dukkanIdFromMeta) {
          dukkanId = dukkanIdFromMeta;
        } else {
          // If not in metadata, try profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('dukkan_id')
            .eq('id', user.id)
            .maybeSingle();
          
          if (profileData?.dukkan_id) {
            dukkanId = profileData.dukkan_id;
          } else {
            // Try personel table
            const { data: personelData } = await supabase
              .from('personel')
              .select('dukkan_id')
              .eq('auth_id', user.id)
              .maybeSingle();
            
            if (personelData?.dukkan_id) {
              dukkanId = personelData.dukkan_id;
            } else {
              // As fallback, try to get shop ID where user is owner
              const { data: shopData } = await supabase
                .from('dukkanlar')
                .select('id')
                .eq('sahibi_id', user.id)
                .maybeSingle();
              
              if (shopData?.id) {
                dukkanId = shopData.id;
              }
            }
          }
        }
      }
      
      if (!dukkanId) {
        console.error("Dükkan ID bulunamadı");
        return [];
      }
      
      const { data, error } = await supabase.rpc(
        'get_appointments_by_dukkan',
        { p_dukkan_id: dukkanId }
      );
      
      if (error) {
        console.error("Randevular getirilemedi:", error);
        return [];
      }
      
      // If we have appointments, get related data (customers, personnel, etc.)
      if (data && data.length > 0) {
        for (const randevu of data) {
          // Get customer info
          if (randevu.musteri_id) {
            const { data: musteriData } = await supabase
              .from('musteriler')
              .select('*')
              .eq('id', randevu.musteri_id)
              .maybeSingle();
            
            if (musteriData) {
              randevu.musteri = musteriData;
            }
          }
          
          // Get personnel info
          if (randevu.personel_id) {
            const { data: personelData } = await supabase
              .from('personel')
              .select('*')
              .eq('id', randevu.personel_id)
              .maybeSingle();
            
            if (personelData) {
              randevu.personel = personelData;
            }
          }
        }
      }
      
      return data || [];
    } catch (error) {
      console.error("Randevu verileri alınırken hata oluştu:", error);
      return [];
    }
  },
  
  // Get appointments for the current user
  async kendiRandevulariniGetir(userId: string | null) {
    try {
      if (!userId) {
        // Try to get the current user id
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("Kullanıcı bilgisi bulunamadı");
          return [];
        }
        
        userId = user.id;
      }
      
      const { data, error } = await supabase.rpc(
        'get_customer_appointments',
        { p_customer_id: userId }
      );
      
      if (error) {
        console.error("Randevular getirilemedi:", error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Randevu verileri alınırken hata oluştu:", error);
      return [];
    }
  },

  // Helper method to get the current user's dukkan_id
  async getCurrentUserDukkanId() {
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
  
  async randevuOlustur(randevuVerisi: Partial<Randevu>) {
    try {
      const { data, error } = await supabase.rpc(
        'create_appointment',
        {
          p_dukkan_id: randevuVerisi.dukkan_id || 0,
          p_musteri_id: randevuVerisi.musteri_id || 0,
          p_personel_id: randevuVerisi.personel_id || null,
          p_tarih: randevuVerisi.tarih || '',
          p_saat: randevuVerisi.saat || '',
          p_durum: randevuVerisi.durum || 'onaylandi',
          p_notlar: randevuVerisi.notlar || '',
          p_islemler: randevuVerisi.islemler || [],
          p_customer_id: randevuVerisi.customer_id || null
        }
      );
      
      if (error) {
        console.error("Randevu oluşturma hatası:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Randevu oluşturulurken hata oluştu:", error);
      throw error;
    }
  },
  
  async randevuGuncelle(id: number, updates: Partial<Randevu>) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Randevu güncelleme hatası:", error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error("Randevu güncellenirken hata oluştu:", error);
      throw error;
    }
  },
  
  async randevuSil(id: number) {
    try {
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Randevu silme hatası:", error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Randevu silinirken hata oluştu:", error);
      throw error;
    }
  },
  
  // For existing alias
  ekle(randevuVerisi: any) {
    return this.randevuOlustur(randevuVerisi);
  }
};
