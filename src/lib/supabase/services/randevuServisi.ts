import { supabase } from '../client';

export const randevuServisi = {
  async randevuOlustur(randevuVerisi: Partial<any>) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .insert(randevuVerisi)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
      throw error;
    }
  },

  async randevuGuncelle(id: number, updates: Partial<any>) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Randevu güncelleme hatası:', error);
      throw error;
    }
  },

  async randevuSil(id: number) {
    try {
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Randevu silme hatası:', error);
      throw error;
    }
  },

  async randevuDurumGuncelle(id: number, durum: string) {
    return this.randevuGuncelle(id, { durum });
  },

  async durumGuncelle(id: number, durum: string) {
    return this.randevuGuncelle(id, { durum });
  },

  async hepsiniGetir() {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .order('tarih', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Randevu listesi getirme hatası:', error);
      return [];
    }
  },

  async dukkanRandevulariniGetir(dukkanId: number | null) {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return [];

      // If no dukkanId provided, try to get user's dukkan_id
      let shopId = dukkanId;
      if (!shopId) {
        // Check if user is an admin/owner with a shop
        const { data: dukkanData } = await supabase
          .from('dukkanlar')
          .select('id')
          .eq('sahibi_id', userId)
          .maybeSingle();

        if (dukkanData?.id) {
          shopId = dukkanData.id;
        } else {
          // Check if user is staff
          const { data: personelData } = await supabase
            .from('personel')
            .select('dukkan_id')
            .eq('auth_id', userId)
            .maybeSingle();

          if (personelData?.dukkan_id) {
            shopId = personelData.dukkan_id;
          } else {
            // Check profiles table as last resort
            const { data: profileData } = await supabase
              .from('profiles')
              .select('dukkan_id')
              .eq('id', userId)
              .maybeSingle();

            if (profileData?.dukkan_id) {
              shopId = profileData.dukkan_id;
            }
          }
        }
      }

      if (!shopId) {
        console.warn('Could not determine dukkan_id for appointments');
        return [];
      }

      const { data, error } = await supabase
        .from('randevular')
        .select('*, musteri:musteriler(*), personel:personel(*)')
        .eq('dukkan_id', shopId)
        .order('tarih', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Dükkan randevuları getirme hatası:', error);
      return [];
    }
  },

  async kendiRandevulariniGetir(userId: string | null) {
    try {
      if (!userId) {
        userId = (await supabase.auth.getUser()).data.user?.id;
      }
      
      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('randevular')
        .select('*, dukkan:dukkanlar(*), personel:personel(*)')
        .eq('customer_id', userId)
        .order('tarih', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kendi randevularını getirme hatası:', error);
      return [];
    }
  },
  
  async musteriRandevulari(musteriId: number) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*, personel:personel(*)')
        .eq('musteri_id', musteriId)
        .order('tarih', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Müşteri (${musteriId}) randevuları getirme hatası:`, error);
      return [];
    }
  },
  
  async getCurrentUserDukkanId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Try to get dukkan_id from user metadata first
      if (user.user_metadata?.dukkan_id) return user.user_metadata.dukkan_id;
      
      // Check if user is a shop owner
      const { data: shopData } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .maybeSingle();
      
      if (shopData?.id) return shopData.id;
      
      // Check if user is staff
      const { data: personelData } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      if (personelData?.dukkan_id) return personelData.dukkan_id;
      
      // Check profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .maybeSingle();
      
      return profileData?.dukkan_id || null;
    } catch (error) {
      console.error("Error getting current user's dukkan_id:", error);
      return null;
    }
  }
};
