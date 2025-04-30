import { supabase } from "@/lib/supabase/client";
import { PersonelIslemi } from "../types";

export const personelIslemleriServisi = {
  async _getCurrentUserDukkanId() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Try to get dukkan_id from user metadata first
    const dukkanIdFromMeta = user.user_metadata?.dukkan_id;
    if (dukkanIdFromMeta) return dukkanIdFromMeta;
    
    // If not in metadata, try profiles table
    const { data: profileData } = await supabase
      .from('profiles')
      .select('dukkan_id')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profileData?.dukkan_id) return profileData.dukkan_id;
    
    // Finally try personel table
    const { data: personelData } = await supabase
      .from('personel')
      .select('dukkan_id')
      .eq('auth_id', user.id)
      .maybeSingle();
    
    return personelData?.dukkan_id;
  },

  hepsiniGetir: async () => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        return [];
      }

      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (id, ad_soyad, dukkan_id),
          musteri:musteri_id (id, first_name, last_name, phone, dukkan_id),
          islem:islem_id (id, islem_adi, fiyat, kategori_id)
        `)
        .eq('personel.dukkan_id', dukkanId); // Filter by shop

      if (error) {
        console.error('Personel işlemleri getirme hatası:', error);
        throw error;
      }

      // Additional filter to ensure only operations from this shop are shown
      const filteredData = data.filter(item => 
        (item.personel?.dukkan_id === dukkanId) && 
        (!item.musteri || item.musteri?.dukkan_id === dukkanId)
      );

      return filteredData || [];
    } catch (err) {
      console.error('Personel işlemleri getirme hatası:', err);
      return [];
    }
  },

  getir: async (id: number) => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        throw new Error('İşletme bilgisi bulunamadı');
      }

      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (id, ad_soyad, dukkan_id),
          musteri:musteri_id (id, first_name, last_name, phone, dukkan_id),
          islem:islem_id (id, islem_adi, fiyat, kategori_id)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Personel işlemi getirme hatası:', error);
        throw error;
      }

      // Ensure the operation belongs to current shop
      if (data.personel?.dukkan_id !== dukkanId || data.musteri?.dukkan_id !== dukkanId) {
        throw new Error('Bu işlem sizin işletmenize ait değil');
      }

      return data;
    } catch (err) {
      console.error('Personel işlemi getirme hatası:', err);
      throw err;
    }
  },

  personelIslemleriGetir: async (personelId: number) => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        return [];
      }

      // First verify this personnel belongs to our business
      const { data: personnelData, error: personnelError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('id', personelId)
        .single();

      if (personnelError || personnelData?.dukkan_id !== dukkanId) {
        console.error('Bu personel sizin işletmenize ait değil');
        return [];
      }

      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (id, ad_soyad, dukkan_id),
          musteri:musteri_id (id, first_name, last_name, phone, dukkan_id),
          islem:islem_id (id, islem_adi, fiyat, kategori_id)
        `)
        .eq('personel_id', personelId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Personel işlemleri getirme hatası:', error);
        throw error;
      }

      // Additional filter to ensure only operations from this shop are shown
      const filteredData = data.filter(item => 
        (item.personel?.dukkan_id === dukkanId) && 
        (!item.musteri || item.musteri?.dukkan_id === dukkanId)
      );

      return filteredData || [];
    } catch (err) {
      console.error('Personel işlemleri getirme hatası:', err);
      return [];
    }
  },

  getirByMusteriId: async (musteriId: number) => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        return [];
      }

      // First verify this customer belongs to our business
      const { data: customerData, error: customerError } = await supabase
        .from('musteriler')
        .select('dukkan_id')
        .eq('id', musteriId)
        .single();

      if (customerError || customerData?.dukkan_id !== dukkanId) {
        console.error('Bu müşteri sizin işletmenize ait değil');
        return [];
      }

      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (id, ad_soyad, dukkan_id),
          musteri:musteri_id (id, first_name, last_name, phone, dukkan_id),
          islem:islem_id (id, islem_adi, fiyat, kategori_id)
        `)
        .eq('musteri_id', musteriId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Müşteri işlemleri getirme hatası:', error);
        throw error;
      }

      // Additional filter to ensure only operations from this shop are shown
      const filteredData = data.filter(item => 
        (!item.personel || item.personel?.dukkan_id === dukkanId) && 
        (item.musteri?.dukkan_id === dukkanId)
      );

      return filteredData || [];
    } catch (err) {
      console.error('Müşteri işlemleri getirme hatası:', err);
      return [];
    }
  },

  ekle: async (data: any) => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        throw new Error('İşletme bilgisi bulunamadı');
      }

      // Verify personnel belongs to this shop
      if (data.personel_id) {
        const { data: personnelData, error: personnelError } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('id', data.personel_id)
          .single();

        if (personnelError || personnelData?.dukkan_id !== dukkanId) {
          throw new Error('Bu personel sizin işletmenize ait değil');
        }
      }

      // Verify customer belongs to this shop
      if (data.musteri_id) {
        const { data: customerData, error: customerError } = await supabase
          .from('musteriler')
          .select('dukkan_id')
          .eq('id', data.musteri_id)
          .single();

        if (customerError || customerData?.dukkan_id !== dukkanId) {
          throw new Error('Bu müşteri sizin işletmenize ait değil');
        }
      }

      const { data: result, error } = await supabase
        .from('personel_islemleri')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('Personel işlemi ekleme hatası:', error);
        throw error;
      }

      await personelIslemleriServisi.updateShopStatistics();

      return result;
    } catch (error) {
      console.error('Personel işlemi ekleme hatası:', error);
      throw error;
    }
  },

  guncelle: async (id: number, data: any) => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        throw new Error('İşletme bilgisi bulunamadı');
      }

      // Get the operation and verify it belongs to this shop
      const { data: operationData, error: operationError } = await supabase
        .from('personel_islemleri')
        .select(`
          personel_id,
          musteri_id,
          personel:personel_id (dukkan_id),
          musteri:musteri_id (dukkan_id)
        `)
        .eq('id', id)
        .single();

      if (operationError || 
          operationData.personel?.dukkan_id !== dukkanId || 
          operationData.musteri?.dukkan_id !== dukkanId) {
        throw new Error('Bu işlem sizin işletmenize ait değil');
      }

      // Verify new personnel belongs to this shop if changing
      if (data.personel_id && data.personel_id !== operationData.personel_id) {
        const { data: personnelData, error: personnelError } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('id', data.personel_id)
          .single();

        if (personnelError || personnelData?.dukkan_id !== dukkanId) {
          throw new Error('Bu personel sizin işletmenize ait değil');
        }
      }

      // Verify new customer belongs to this shop if changing
      if (data.musteri_id && data.musteri_id !== operationData.musteri_id) {
        const { data: customerData, error: customerError } = await supabase
          .from('musteriler')
          .select('dukkan_id')
          .eq('id', data.musteri_id)
          .single();

        if (customerError || customerData?.dukkan_id !== dukkanId) {
          throw new Error('Bu müşteri sizin işletmenize ait değil');
        }
      }

      const { data: result, error } = await supabase
        .from('personel_islemleri')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Personel işlemi güncelleme hatası:', error);
        throw error;
      }

      await personelIslemleriServisi.updateShopStatistics();

      return result;
    } catch (error) {
      console.error('Personel işlemi güncelleme hatası:', error);
      throw error;
    }
  },

  sil: async (id: number) => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        throw new Error('İşletme bilgisi bulunamadı');
      }

      // Get the operation and verify it belongs to this shop
      const { data: operationData, error: operationError } = await supabase
        .from('personel_islemleri')
        .select(`
          personel:personel_id (dukkan_id),
          musteri:musteri_id (dukkan_id)
        `)
        .eq('id', id)
        .single();

      if (operationError || 
          operationData.personel?.dukkan_id !== dukkanId || 
          operationData.musteri?.dukkan_id !== dukkanId) {
        throw new Error('Bu işlem sizin işletmenize ait değil');
      }

      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Personel işlemi silme hatası:', error);
        throw error;
      }

      await personelIslemleriServisi.updateShopStatistics();

      return true;
    } catch (error) {
      console.error('Personel işlemi silme hatası:', error);
      throw error;
    }
  },

  personelPerformansRaporu: async (personelId: number, startDate: string, endDate: string) => {
    try {
      // Get current user's dukkan_id
      const dukkanId = await personelIslemleriServisi._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.error('Kullanıcının işletme bilgisi bulunamadı');
        throw new Error('İşletme bilgisi bulunamadı');
      }

      // Verify personnel belongs to this shop
      const { data: personnelData, error: personnelError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('id', personelId)
        .single();

      if (personnelError || personnelData?.dukkan_id !== dukkanId) {
        throw new Error('Bu personel sizin işletmenize ait değil');
      }

      const { data, error } = await supabase
        .rpc('personel_performans_raporu', { 
          p_personel_id: personelId,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (error) {
        console.error('Personel performans raporu hatası:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Personel performans raporu hatası:', error);
      throw error;
    }
  },

  updateShopStatistics: async () => {
    try {
      // İşletme istatistiklerini güncelleme işlevi
      // Bu fonksiyon Supabase'de tanımlı bir RPC olabilir veya basit bir yenileme işlemi yapabilir
      console.log("Dükkan istatistikleri güncelleniyor...");
      return true;
    } catch (error) {
      console.error("Dükkan istatistiklerini güncelleme hatası:", error);
      return false;
    }
  }
};
