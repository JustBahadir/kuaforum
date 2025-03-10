
import { supabase } from '../client';
import { Personel } from '../types';

export const personelServisi = {
  async hepsiniGetir() {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*, profiles(iban)');

      if (error) {
        console.error("Personel listesi alınırken hata:", error);
        throw error;
      }

      // Transform data to include IBAN from profiles if available
      const transformedData = data?.map(personel => {
        const profileIban = personel.profiles?.iban || null;
        return {
          ...personel,
          iban: personel.iban || profileIban,
          profiles: undefined // Remove nested profiles object
        };
      }) || [];

      return transformedData;
    } catch (error) {
      console.error("Personel listesi alınırken hata:", error);
      throw error;
    }
  },

  async getirById(id: number) {
    try {
      console.log("Personel getiriliyor, ID:", id);
      
      // First attempt - get personel with profiles join for IBAN
      const { data, error } = await supabase
        .from('personel')
        .select('*, profiles(iban)')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Personel getirme hatası (ilk deneme):", error);
        
        // Second attempt - get just personel without join
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('personel')
          .select('*')
          .eq('id', id)
          .single();
        
        if (fallbackError) {
          console.error("Personel getirme hatası (ikinci deneme):", fallbackError);
          throw fallbackError;
        }
        
        return fallbackData;
      }
      
      if (!data) {
        throw new Error("Personel bulunamadı");
      }
      
      // Transform data to include IBAN from profiles if available
      const profileIban = data.profiles?.iban || null;
      const transformedData = {
        ...data,
        iban: data.iban || profileIban,
        profiles: undefined // Remove nested profiles object
      };
      
      return transformedData;
    } catch (error) {
      console.error("Personel getirme hatası:", error);
      throw error;
    }
  },

  async getirByAuthId(authId: string) {
    try {
      // Get personnel by auth ID with profiles join for IBAN
      const { data, error } = await supabase
        .from('personel')
        .select('*, dukkan(*), profiles(iban)')
        .eq('auth_id', authId)
        .maybeSingle();

      if (error) {
        console.error("Auth ID ile personel getirme hatası:", error);
        throw error;
      }
      
      if (!data) return null;
      
      // Transform data to include IBAN from profiles if available
      const profileIban = data.profiles?.iban || null;
      const transformedData = {
        ...data,
        iban: data.iban || profileIban,
        profiles: undefined // Remove nested profiles object
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
          }
        } catch (profileUpdateError) {
          console.warn("Profil IBAN güncellemesi hatası:", profileUpdateError);
          // Continue anyway, personnel record is updated
        }
      }
      
      return data;
    } catch (error) {
      console.error("Personel güncelleme hatası:", error);
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
