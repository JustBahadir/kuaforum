import { supabase } from '../client';
import { PersonelIslemi } from '../types';

export const personelIslemleriServisi = {
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
        console.warn("Kullanıcının işletme bilgisi bulunamadı");
        return [];
      }

      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(*),
          musteri:musteri_id(*),
          islem:islem_id(*)
        `)
        .eq('dukkan_id', dukkanId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Personel işlemleri getirme hatası:", error);
      return [];
    }
  },

  async getir(id: number) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(*),
          musteri:musteri_id(*),
          islem:islem_id(*)
        `)
        .eq('id', id)
        .eq('dukkan_id', dukkanId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Personel işlemi getirme hatası:", error);
      throw error;
    }
  },

  async personelIslemleriGetir(personel_id: number) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.warn("Kullanıcının işletme bilgisi bulunamadı");
        return [];
      }

      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(*),
          musteri:musteri_id(*),
          islem:islem_id(*)
        `)
        .eq('personel_id', personel_id)
        .eq('dukkan_id', dukkanId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Personel işlemleri getirme hatası:", error);
      return [];
    }
  },

  async getirByMusteriId(musteri_id: number) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.warn("Kullanıcının işletme bilgisi bulunamadı");
        return [];
      }

      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(*),
          musteri:musteri_id(*),
          islem:islem_id(*)
        `)
        .eq('musteri_id', musteri_id)
        .eq('dukkan_id', dukkanId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Müşteri işlemleri getirme hatası:", error);
      return [];
    }
  },

  async musteriIslemleriGetir(musteri_id: number) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.warn("Kullanıcının işletme bilgisi bulunamadı");
        return [];
      }
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(*),
          musteri:musteri_id(*),
          islem:islem_id(*)
        `)
        .eq('musteri_id', musteri_id)
        .eq('dukkan_id', dukkanId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Müşteri işlemleri getirme hatası:", error);
      return [];
    }
  },

  async randevuIslemleriGetir(randevu_id: number) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.warn("Kullanıcının işletme bilgisi bulunamadı");
        return [];
      }
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(*),
          musteri:musteri_id(*),
          islem:islem_id(*)
        `)
        .eq('randevu_id', randevu_id)
        .eq('dukkan_id', dukkanId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Randevu işlemleri getirme hatası:", error);
      return [];
    }
  },

  async ekle(islem: Omit<PersonelIslemi, 'id' | 'created_at'>) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      // Add dukkan_id to the islem
      const islemToInsert = {
        ...islem,
        dukkan_id: dukkanId
      };
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .insert(islemToInsert)
        .select(`
          *,
          personel:personel_id(*),
          musteri:musteri_id(*),
          islem:islem_id(*)
        `);

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("Personel işlemi eklenirken hata:", error);
      throw error;
    }
  },

  async guncelle(id: number, islem: Partial<PersonelIslemi>) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      // Ensure we're only updating islemler for this shop
      const { data, error } = await supabase
        .from('personel_islemleri')
        .update(islem)
        .eq('id', id)
        .eq('dukkan_id', dukkanId)
        .select(`
          *,
          personel:personel_id(*),
          musteri:musteri_id(*),
          islem:islem_id(*)
        `);

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("Personel işlemi güncellenirken hata:", error);
      throw error;
    }
  },

  async sil(id: number) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      // Ensure we're only deleting islemler for this shop
      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', id)
        .eq('dukkan_id', dukkanId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Personel işlemi silinirken hata:", error);
      throw error;
    }
  },
  
  async personelIslemleriOzeti(personelId: number, baslangicTarihi: string, bitisTarihi: string) {
    try {
      const userDukkanId = await this._getCurrentUserDukkanId();
      if (!userDukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      // Get all operations for this staff member in the date range
      const { data: allOperations, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(*)
        `)
        .eq('personel_id', personelId)
        .gte('created_at', baslangicTarihi)
        .lte('created_at', bitisTarihi)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Filter for records with matching dukkan_id
      const dukkanOperations = allOperations.filter(op => {
        if (!op.personel) return false;
        if (!op.dukkan_id) return false;
        return op.dukkan_id === userDukkanId;
      });
      
      // Calculate totals
      let toplamTutar = 0;
      let toplamPrim = 0;
      let toplamPuan = 0;
      let islemSayisi = dukkanOperations.length;
      
      dukkanOperations.forEach(islem => {
        toplamTutar += islem.tutar || 0;
        toplamPrim += (islem.tutar || 0) * (islem.prim_yuzdesi || 0) / 100;
        toplamPuan += islem.puan || 0;
      });
      
      return {
        islemler: dukkanOperations,
        ozet: {
          toplamTutar,
          toplamPrim,
          toplamPuan,
          islemSayisi
        }
      };
    } catch (error) {
      console.error("Personel işlemleri özeti alınırken hata:", error);
      throw error;
    }
  },

  async updateShopStatistics() {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.warn("İşletme ID bulunamadı, istatistikler güncellenemedi");
        return false;
      }

      // Notify that statistics update is happening
      console.log(`İşletme ${dukkanId} için istatistikler güncelleniyor`);
      
      // This would ideally call a stored procedure or function to update statistics
      // For now, we'll just return true to indicate success
      return true;
    } catch (error) {
      console.error("İstatistik güncelleme hatası:", error);
      return false;
    }
  }
};
