
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
          iban: personel.iban || null,
          avatar_url: personel.avatar_url || null
        };
      }) || [];

      // Now try to get profile data for each personnel with auth_id
      const fetchPromises = transformedData
        .filter(personel => personel.auth_id)
        .map(async personel => {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('iban, first_name, last_name, phone, avatar_url, address, birthdate')
              .eq('id', personel.auth_id)
              .maybeSingle();
              
            if (profileData) {
              // Update personel record with profile data
              let updatedFields: any = {};
              
              if (profileData.iban) {
                personel.iban = profileData.iban;
                updatedFields.iban = profileData.iban;
              }
              
              if (profileData.first_name || profileData.last_name) {
                const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
                if (fullName && fullName !== personel.ad_soyad) {
                  personel.ad_soyad = fullName;
                  updatedFields.ad_soyad = fullName;
                }
              }
              
              if (profileData.phone && profileData.phone !== personel.telefon) {
                personel.telefon = profileData.phone;
                updatedFields.telefon = profileData.phone;
              }
              
              if (profileData.address && profileData.address !== personel.adres) {
                personel.adres = profileData.address;
                updatedFields.adres = profileData.address;
              }
              
              if (profileData.avatar_url) {
                personel.avatar_url = profileData.avatar_url;
                updatedFields.avatar_url = profileData.avatar_url;
              }
              
              if (profileData.birthdate) {
                personel.birth_date = profileData.birthdate;
                updatedFields.birth_date = profileData.birthdate;
              }
              
              // Only update if we have changes
              if (Object.keys(updatedFields).length > 0) {
                await supabase
                  .from('personel')
                  .update(updatedFields)
                  .eq('id', personel.id);
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
      
      // Try to get profile data if auth_id exists
      let iban = data.iban;
      let ad_soyad = data.ad_soyad;
      let telefon = data.telefon;
      let adres = data.adres;
      let avatar_url = data.avatar_url;
      let birth_date = data.birth_date;
      
      if (data.auth_id) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('iban, first_name, last_name, phone, avatar_url, address, birthdate')
            .eq('id', data.auth_id)
            .maybeSingle();
            
          if (profileData) {
            // Update fields from profile
            if (profileData.iban) {
              iban = profileData.iban;
            }
            
            if (profileData.first_name || profileData.last_name) {
              const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
              if (fullName) {
                ad_soyad = fullName;
              }
            }
            
            if (profileData.phone) {
              telefon = profileData.phone;
            }
            
            if (profileData.address) {
              adres = profileData.address;
            }
            
            if (profileData.avatar_url) {
              avatar_url = profileData.avatar_url;
            }
            
            if (profileData.birthdate) {
              birth_date = profileData.birthdate;
            }
            
            // Update personel record if we got updated data from profile
            let updatedFields: any = {};
            let hasChanges = false;
            
            if (iban && iban !== data.iban) {
              updatedFields.iban = iban;
              hasChanges = true;
            }
            
            if (ad_soyad !== data.ad_soyad) {
              updatedFields.ad_soyad = ad_soyad;
              hasChanges = true;
            }
            
            if (telefon !== data.telefon) {
              updatedFields.telefon = telefon;
              hasChanges = true;
            }
            
            if (adres !== data.adres) {
              updatedFields.adres = adres;
              hasChanges = true;
            }
            
            if (avatar_url && avatar_url !== data.avatar_url) {
              updatedFields.avatar_url = avatar_url;
              hasChanges = true;
            }
            
            if (birth_date && birth_date !== data.birth_date) {
              updatedFields.birth_date = birth_date;
              hasChanges = true;
            }
            
            if (hasChanges) {
              await supabase
                .from('personel')
                .update(updatedFields)
                .eq('id', id);
            }
          }
        } catch (profileError) {
          // Non-critical, just log the error
          console.warn("Personel için profil bilgisi alınamadı:", profileError);
        }
      }
      
      const transformedData = {
        ...data,
        iban,
        ad_soyad,
        telefon,
        adres,
        avatar_url,
        birth_date
      };
      
      // Format IBAN for display if it exists
      if (transformedData.iban) {
        transformedData.formattedIban = profilServisi.formatIBAN(transformedData.iban);
      }
      
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
      
      // Remove the iban field from the update to prevent the error
      const { maas, ...otherFields } = personel;
      
      const updateFields: any = {};
      if (maas !== undefined) updateFields.maas = maas;
      
      // Add other fields if needed, excluding iban
      Object.keys(otherFields).forEach(key => {
        if (key !== 'iban' && otherFields[key as keyof typeof otherFields] !== undefined) {
          updateFields[key] = otherFields[key as keyof typeof otherFields];
        }
      });
      
      console.log("Güncellenecek alanlar:", updateFields);
      
      const { data, error } = await supabase
        .from('personel')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Personel güncelleme hatası:", error);
        throw error;
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
