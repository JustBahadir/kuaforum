
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

      // Now try to get profile data from profiles for each personnel with auth_id
      const fetchPromises = transformedData
        .filter(personel => personel.auth_id)
        .map(async personel => {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('iban, address, birthdate')
              .eq('id', personel.auth_id)
              .maybeSingle();
              
            if (profileData) {
              // Update personnel record with profile data
              const updates: Partial<Personel> = {};
              
              if (profileData.iban) {
                personel.iban = profileData.iban;
                updates.iban = profileData.iban;
              }
              
              if (profileData.address && profileData.address !== personel.adres) {
                personel.adres = profileData.address;
                updates.adres = profileData.address;
              }
              
              if (profileData.birthdate) {
                personel.birthdate = profileData.birthdate;
                updates.birthdate = profileData.birthdate;
              }
              
              // Only update if we have changes
              if (Object.keys(updates).length > 0) {
                await supabase
                  .from('personel')
                  .update(updates)
                  .eq('id', personel.id);
                
                console.log(`Personel ${personel.id} profil verileriyle güncellendi:`, updates);
              }
            }
          } catch (profileError) {
            // Just log the error but continue, this is non-critical
            console.warn("Personel için profil bilgisi alınamadı:", profileError);
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
      
      // Try to get profile data from profiles if auth_id exists
      let profileData = {
        iban: data.iban || "",
        address: data.adres || "",
        birthdate: data.birthdate || ""
      };
      
      if (data.auth_id) {
        try {
          const { data: userData } = await supabase
            .from('profiles')
            .select('iban, birthdate, gender, address')
            .eq('id', data.auth_id)
            .maybeSingle();
            
          if (userData) {
            profileData = {
              iban: userData.iban || data.iban || "",
              address: userData.address || data.adres || "",
              birthdate: userData.birthdate || data.birthdate || ""
            };
            
            // Update personel record with profile data for consistency
            const updates: Record<string, any> = {};
            let hasUpdates = false;
            
            if (userData.iban && userData.iban !== data.iban) {
              updates.iban = userData.iban;
              hasUpdates = true;
            }
            
            if (userData.address && userData.address !== data.adres) {
              updates.adres = userData.address;
              hasUpdates = true;
            }
            
            if (userData.birthdate && userData.birthdate !== data.birthdate) {
              updates.birthdate = userData.birthdate;
              hasUpdates = true;
            }
            
            if (hasUpdates) {
              await supabase
                .from('personel')
                .update(updates)
                .eq('id', id);
                
              console.log(`Personel ${id} profil verileriyle güncellendi:`, updates);
            }
          }
        } catch (profileError) {
          console.warn("Personel için profil bilgisi alınamadı:", profileError);
        }
      }
      
      const transformedData = {
        ...data,
        iban: profileData.iban,
        adres: profileData.address,
        birthdate: profileData.birthdate
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
      
      // Try to get IBAN and other data from profiles
      let iban = data.iban;
      let adres = data.adres;
      let birthdate = data.birthdate;
      
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('iban, address, birthdate')
          .eq('id', authId)
          .maybeSingle();
          
        if (profileData) {
          iban = profileData.iban || iban;
          adres = profileData.address || adres;
          birthdate = profileData.birthdate || birthdate;
          
          // Update personel if profile data differs
          const updates: Record<string, any> = {};
          let hasUpdates = false;
          
          if (profileData.iban && profileData.iban !== data.iban) {
            updates.iban = profileData.iban;
            hasUpdates = true;
          }
          
          if (profileData.address && profileData.address !== data.adres) {
            updates.adres = profileData.address;
            hasUpdates = true;
          }
          
          if (profileData.birthdate && profileData.birthdate !== data.birthdate) {
            updates.birthdate = profileData.birthdate;
            hasUpdates = true;
          }
          
          if (hasUpdates) {
            await supabase
              .from('personel')
              .update(updates)
              .eq('id', data.id);
          }
        }
      } catch (profileError) {
        // Non-critical, just log the error
        console.warn("Personel için profil bilgisi alınamadı:", profileError);
      }
      
      const transformedData = {
        ...data,
        iban,
        adres,
        birthdate
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
      
      // If IBAN, address or birthdate is included, also update the profile if auth_id exists
      if ((personel.iban || personel.adres || personel.birthdate) && data.auth_id) {
        try {
          const updateData: Record<string, any> = {};
          if (personel.iban) updateData.iban = personel.iban;
          if (personel.adres) updateData.address = personel.adres;
          if (personel.birthdate) updateData.birthdate = personel.birthdate;
          
          const { error: profileError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', data.auth_id);
          
          if (profileError) {
            console.warn("Profil güncelleme başarısız:", profileError);
          } else {
            console.log("Profil başarıyla güncellendi");
          }
        } catch (profileUpdateError) {
          console.warn("Profil güncelleme hatası:", profileUpdateError);
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
