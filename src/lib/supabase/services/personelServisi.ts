
import { supabase } from '../client';
import { Personel } from '../types';
import { profilServisi } from './profilServisi';
import { toast } from "sonner";

export const personelServisi = {
  async hepsiniGetir() {
    try {
      console.log("Personel listesi getiriliyor...");
      
      // Get all personnel without trying to join with profiles
      const { data, error } = await supabase
        .from('personel')
        .select('*');

      if (error) {
        console.error("Personel listesi alınırken hata:", error);
        throw error;
      }

      // Transform data to get a clean response
      const transformedData = data?.map(personel => {
        return {
          ...personel,
          iban: personel.iban || null
        };
      }) || [];

      // Now try to get IBAN data from profiles for each personnel with auth_id
      const fetchPromises = transformedData
        .filter(personel => personel.auth_id)
        .map(async personel => {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('iban')
              .eq('id', personel.auth_id)
              .maybeSingle();
              
            if (profileData?.iban) {
              personel.iban = profileData.iban;
              
              // Update personel record if we got an IBAN from profile
              await supabase
                .from('personel')
                .update({ iban: profileData.iban })
                .eq('id', personel.id);
            }
          } catch (profileError) {
            // Just log the error but continue, this is non-critical
            console.warn("Personel için profil IBAN bilgisi alınamadı:", profileError);
          }
        });
        
      // Wait for all profile data fetches to complete
      await Promise.allSettled(fetchPromises);

      return transformedData;
    } catch (error) {
      console.error("Personel listesi alınırken hata:", error);
      throw error;
    }
  },

  async getirById(id: number) {
    try {
      console.log("Personel getiriliyor, ID:", id);
      
      // Get personnel by ID without joining
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Personel getirme hatası:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Personel bulunamadı");
      }
      
      // Try to get IBAN from profiles if auth_id exists
      let iban = data.iban;
      if (data.auth_id) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('iban')
            .eq('id', data.auth_id)
            .maybeSingle();
            
          if (profileData?.iban) {
            iban = profileData.iban;
            
            // Update personel record if we got an IBAN from profile
            if (iban !== data.iban) {
              await supabase
                .from('personel')
                .update({ iban })
                .eq('id', id);
            }
          }
        } catch (profileError) {
          // Non-critical, just log the error
          console.warn("Personel için profil IBAN bilgisi alınamadı:", profileError);
        }
      }
      
      const transformedData = {
        ...data,
        iban
      };
      
      return transformedData;
    } catch (error) {
      console.error("Personel getirme hatası:", error);
      throw error;
    }
  },

  async getirByAuthId(authId: string) {
    try {
      // Get personnel by auth ID without joining with dukkan
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('auth_id', authId)
        .maybeSingle();

      if (error) {
        console.error("Auth ID ile personel getirme hatası:", error);
        throw error;
      }
      
      if (!data) return null;
      
      // Try to get IBAN from profiles
      let iban = data.iban;
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('iban')
          .eq('id', authId)
          .maybeSingle();
          
        if (profileData?.iban) {
          iban = profileData.iban;
        }
      } catch (profileError) {
        // Non-critical, just log the error
        console.warn("Personel için profil IBAN bilgisi alınamadı:", profileError);
      }
      
      const transformedData = {
        ...data,
        iban
      };
      
      return transformedData;
    } catch (error) {
      console.error("Auth ID ile personel getirme hatası:", error);
      throw error;
    }
  },

  async ekle(personel: Omit<Personel, "id" | "created_at">) {
    try {
      const { data, error } = await supabase
        .from('personel')
        .insert([personel])
        .select()
        .single();

      if (error) {
        console.error("Personel ekleme hatası:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Personel ekleme hatası:", error);
      throw error;
    }
  },

  async guncelle(id: number, personel: Partial<Personel>) {
    try {
      console.log(`Personel ${id} güncelleniyor:`, personel);
      
      // Update personnel record
      const { data, error } = await supabase
        .from('personel')
        .update(personel)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Personel güncelleme hatası:", error);
        throw error;
      }
      
      // If IBAN is included, also update the profile if auth_id exists
      if (personel.iban && data.auth_id) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ iban: personel.iban })
            .eq('id', data.auth_id);
          
          if (profileError) {
            console.warn("Profil IBAN güncellemesi başarısız:", profileError);
            // Continue anyway, personnel record is updated
          } else {
            console.log("Profil IBAN başarıyla güncellendi");
          }
        } catch (profileUpdateError) {
          console.warn("Profil IBAN güncellemesi hatası:", profileUpdateError);
          // Continue anyway, personnel record is updated
        }
      }
      
      toast.success("Personel bilgileri başarıyla güncellendi");
      return data;
    } catch (error) {
      console.error("Personel güncelleme hatası:", error);
      toast.error("Personel güncellenirken bir hata oluştu: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
      throw error;
    }
  },

  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('personel')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Personel silme hatası:", error);
        throw error;
      }
    } catch (error) {
      console.error("Personel silme hatası:", error);
      throw error;
    }
  }
};
