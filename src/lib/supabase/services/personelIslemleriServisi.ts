
import { supabase } from "../client";
import { isletmeServisi } from "./dukkanServisi";

export const personelIslemleriServisi = {
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
  
  async hepsiniGetir(personelId = null) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        return [];
      }
      
      // Build the query
      let query = supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (ad_soyad),
          islem:islem_id (islem_adi, fiyat),
          musteri:musteri_id (first_name, last_name, phone)
        `)
        .eq('dukkan_id', dukkanId)
        .order('created_at', { ascending: false });
      
      // Add personel filter if provided
      if (personelId) {
        query = query.eq('personel_id', personelId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching personel islemleri:", error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in personelIslemleri.hepsiniGetir:", error);
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
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (ad_soyad),
          islem:islem_id (islem_adi, fiyat),
          musteri:musteri_id (first_name, last_name, phone)
        `)
        .eq('id', id)
        .eq('dukkan_id', dukkanId)
        .single();
      
      if (error) {
        console.error("Error fetching personel islemi:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error in personelIslemleri.getir:", error);
      return null;
    }
  },
  
  async personelIslemleriGetir(personel_id) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*')
        .eq('personel_id', personel_id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching personel islemleri:", error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in personelIslemleri.personelIslemleriGetir:", error);
      return [];
    }
  },
  
  async ekle(islem) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        throw new Error("İşletme bilgisi bulunamadı");
      }
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .insert([{ ...islem, dukkan_id: dukkanId }])
        .select();
      
      if (error) {
        console.error("Error adding personel islemi:", error);
        throw error;
      }
      
      // Update shop statistics
      await this.updateShopStatistics(dukkanId);
      
      return data[0];
    } catch (error) {
      console.error("Error in personelIslemleri.ekle:", error);
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
      
      // First verify this operation belongs to our business
      const { data: islemData } = await supabase
        .from('personel_islemleri')
        .select('dukkan_id')
        .eq('id', id)
        .single();
        
      if (islemData?.dukkan_id !== dukkanId) {
        throw new Error("Bu işlem sizin işletmenize ait değil");
      }
      
      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', id)
        .eq('dukkan_id', dukkanId);
      
      if (error) {
        console.error("Error deleting personel islemi:", error);
        throw error;
      }
      
      // Update shop statistics
      await this.updateShopStatistics(dukkanId);
      
      return true;
    } catch (error) {
      console.error("Error in personelIslemleri.sil:", error);
      throw error;
    }
  },
  
  async personelIslemleriOzeti(personelId, baslangicTarihi, bitisTarihi) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        return {
          toplamIslem: 0,
          toplamCiro: 0,
          toplamPrim: 0
        };
      }
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*')
        .eq('personel_id', personelId)
        .eq('dukkan_id', dukkanId)
        .gte('created_at', baslangicTarihi)
        .lte('created_at', bitisTarihi);
      
      if (error) {
        console.error("Error fetching personel islemleri ozeti:", error);
        throw error;
      }
      
      // Calculate summary
      const toplamCiro = data.reduce((sum, item) => sum + Number(item.tutar), 0);
      const toplamPrim = data.reduce((sum, item) => {
        const primOrani = item.prim_yuzdesi || 0;
        return sum + (Number(item.tutar) * primOrani / 100);
      }, 0);
      
      return {
        toplamIslem: data.length,
        toplamCiro,
        toplamPrim
      };
    } catch (error) {
      console.error("Error in personelIslemleri.personelIslemleriOzeti:", error);
      return {
        toplamIslem: 0,
        toplamCiro: 0,
        toplamPrim: 0
      };
    }
  },
  
  // Add missing method to get operations by customer ID
  async getirByMusteriId(musteriId) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error("Kullanıcının işletme bilgisi bulunamadı");
        return [];
      }
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (ad_soyad),
          islem:islem_id (islem_adi, fiyat)
        `)
        .eq('musteri_id', musteriId)
        .eq('dukkan_id', dukkanId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching customer operations:", error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in personelIslemleri.getirByMusteriId:", error);
      return [];
    }
  },
  
  // Add the missing shop statistics update method
  async updateShopStatistics(dukkanId) {
    try {
      if (!dukkanId) {
        console.error("Dükkan ID bulunamadı");
        return false;
      }
      
      console.log("Updating shop statistics for dukkan ID:", dukkanId);
      
      // You can implement shop statistics update logic here
      // For example: recalculate total revenue, customer count, etc.
      
      return true;
    } catch (error) {
      console.error("Error updating shop statistics:", error);
      return false;
    }
  }
};
